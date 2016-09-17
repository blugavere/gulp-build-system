/*
aws certified solution architect

serverless computing
microservices architecture
scalable web app

no server, only clients.

involves servers, but users dont need to think about them.
aws - s3;
https://blog.mitocgroup.com/how-to-create-serverless-environments-on-aws-8485ae039765
small independent processes
language agnostic
highly decoupled
small tasks, modular. trending since 2013.

amazon route53 - abstracted dns service
cloudfront - cdn services3 - storage service
cognito - auth service
api geateway - api gateway service
aws lambda - computing service
amazing elasticache - offloads reads from db
amazon sqs - offloads writes from db
dynamodb - abstracted nosql db

amazon api gateway - api proxy?!

lambda - self managed container service.
dynamodb - no sql key value pair. cost intensive at scale.
memcache or redis.
eventual-consistency use-case. - 

inspired from todomvc.com

https://github.com/MitocGroup/deep-microservices-todomvc

//deepfiy - allows deployment from cli?

deepify server ~/deep-microservices-todomvc -o
deepify can compile back to prior versions?

https://www.npmjs.com/package/deepify

*/

//var fs = require('fs');