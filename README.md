Tarun Sankhla 002294529 - Assignment 1

Health Check RESTful API¶
The question we want to answer is How to detect that a running service instance is unable to handle requests?.
The health check API is a way for us to monitor the health of the application instance and alerts us when something is not working as expected.
Health check API allows us to stop sending traffic to unhealthy instances of the application and to automatically replace/repair them. It also helps us improve user experience by not routing their quests to unhealthy instances.


Database used : PostgreSQl
ORM Framework : Sequilize (node js)

Health check endpoint:  /healthz
User endpoint: /v1/user/self

Steps:
1) npm install and run node index.js
2) W + R => services.msc
3) start and stop the server 
4) check for different endpoint and different REST method
5) check for payload
6) update test to fail the workflow
7) node version 18
8) postgreSQL version 16


commands for packer:
packer plugins install github.com/hashicorp/googlecompute
packer init
packer validate webappImage.json
packer build webappImage.json
gcloud projects add-iam-policy-binding csye-6225-tarun-002294529 --member=serviceAccount:image-builder@csye-6225-tarun-002294529.iam.gserviceaccount.com  --role roles/compute.imageUser

gcloud components update

if you want revert
gcloud components update --version 463.0.0
