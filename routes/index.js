var express = require('express');
var router = express.Router();
var request = require('request');
var async = require('async');
/* GET home page. */
router.get('/', function(req, res) {
  var auth_data = req.query;
  async.waterfall([
		function (callback){
			exchange_token(req, auth_data, function(error, result){
				if(error){
					callback(new Error("failed getting something:" + error));
				}
				callback(null, result);
			})
		},
		function(response, callback){
			async.parallel([
				function(callback){ 
					user_details(response, function(error, result){
						if(error){
							callback(new Error("failed getting something:" + error));
						}
						callback(null, result);
					})
				},
			    function(callback){
			    	organisation_details(response, function(error, result){
			    		if(error){
							callback(new Error("failed getting something:" + error));
						}
						callback(null, result);
			    	})
			    }
			], function(err, results) {
			    callback(null, results);
			})
		}], function (error, success) {
			console.log(success[0].data.attributes, "sddddddddddddddddddddd")
        if (error) { 
        	return res.send("login validation failed");
        	console.log('Something is wrong!'); 
        }
        else{
        	console.log(req.session)
        	req.session.username = success[0].data.attributes.username
        	return res.redirect('/home');
        }
    })
  // var exchange_code = exchange_token(req, auth_data, function(error, result){
  // 	console.log("----------------------------------")
  // })
});

router.get('/home', function(req,res){
	if (req.session.username){
		res.render('index', {title:"Oauth 2.0", user:req.session.username})
	}
	else{
		res.render('index', {title:"Login Failed"})
	}
})

function user_details(body, callback){
    strauth = 'Bearer '+body.access_token
    console.log(strauth)
	var options = {
		'url' :'http://api.tradeboox.com:7600/api/v1/users/'+body.user_id,
		'method':'GET',
    	'headers': {
    		   'content-type': 'application/vnd.api+json',
               'accept':'application/vnd.api+json',
               'authorization': strauth
              }
	}
	request(options, function (error, response, body) {
				console.log(error, response, body);
		        if (!error && response.statusCode == 200) {
		        	callback(null, JSON.parse(body))
		        }
		        else{
		        	callback(error, null)
		        }
		    }
		);
}
function organisation_details(body, callback){
	strauth = 'Bearer '+body.access_token
	var options = {
		'url' :'http://api.tradeboox.com:7600/api/v1/organizations/'+body.organization_id,
		'method':'GET',
    	'headers': {
    		   'content-type': 'application/vnd.api+json',
               'accept':'application/vnd.api+json',
               'authorization': strauth
              }
	}
	request(options, function (error, response, body) {
		        if (!error && response.statusCode == 200) {
		        	callback(null, JSON.parse(body))
		        }
		        else{
		        	callback(error, null)
		        }
		    }
		);
}
var exchange_token = function(req,auth_data, callback){
	if(auth_data.code){
		var auth_session_data = {"code":auth_data.code, 'client_id':'530ae57b-8814-4811-83c4-4a5f7cb0432c', 'redirect_uri':'http://c71fc911.ngrok.io','client_secret':' 14a7b8ef570e452fb595850b828d63e0','grant_type':'authorization_code'}
        var options = {
			"url": "http://api.tradeboox.com:7600/api/v1/oauth2/access_token",
			"method": "POST",
			"headers": {
			    "content-type": "application/vnd.api+json",
			},
			"body": JSON.stringify(auth_session_data)
		};
        request(options, function (error, response, body) {
		        if (!error && response.statusCode == 200) {
		        	callback(null, JSON.parse(body));
		        }
		        else{
		        	callback(error, null);
		        }
		    }
		);
	}
	else{
		callback("code invalid", null);
	}
}
module.exports = router;



