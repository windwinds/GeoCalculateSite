var redis = require("redis");
var pub = redis.createClient(6379, '127.0.0.1');

pub.publish("a nice channel", "I am sending a message.");
pub.publish("a nice channel", "I am sending a second message.");
pub.publish("a nice channel", "I am sending my last message.");

pub.quit();
