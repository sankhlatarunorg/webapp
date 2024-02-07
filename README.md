Tarun Sankhla 002294529 - Assignment 1

Health Check RESTful API¶
The question we want to answer is How to detect that a running service instance is unable to handle requests?.
The health check API is a way for us to monitor the health of the application instance and alerts us when something is not working as expected.
Health check API allows us to stop sending traffic to unhealthy instances of the application and to automatically replace/repair them. It also helps us improve user experience by not routing their quests to unhealthy instances.


Database used : PostgreSQl
ORM Framework : Sequilize (node js)

Health check endpoint:  /healthz

Steps:
1) run node index.js
2) W + R => services.msc
3) start and stop the server 
4) check for different endpoint and different REST method
5) check for payload


npm install:
pg
sequilize
base-64
bcrypt
dotenv
