# TerraGuard - Health Check

This project implements a Health Check RESTful API to monitor the status of a web application. By utilizing this API, you can detect when a service instance is unable to handle requests, allowing for proactive management such as stopping traffic to unhealthy instances and automatically replacing or repairing them. This approach enhances user experience by ensuring requests are not routed to malfunctioning instances.

## Features

- **Health Check Endpoint**: Provides real-time status of the application instance.
- **User Management Endpoint**: Allows for user-related operations.
- **Database Integration**: Utilizes PostgreSQL for data storage.
- **ORM Framework**: Implements Sequelize for database interactions.
- **Packer Integration**: Facilitates the creation of machine images for deployment.

## Prerequisites

- **Node.js**: Version 18.x
- **PostgreSQL**: Version 16.x
- **Packer**: Installed and configured
- **Google Cloud SDK**: For managing Google Cloud resources

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/sankhlatarunorg/webapp.git
   cd webapp
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```
     DB_HOST=your_database_host
     DB_USER=your_database_user
     DB_PASSWORD=your_database_password
     DB_NAME=your_database_name
     ```

4. **Initialize the Database**:
   - Ensure PostgreSQL is running.
   - Run migrations (if applicable) to set up the database schema.

5. **Start the Application**:
   ```bash
   node server.js
   ```

6. **Access the Endpoints**:
   - Health Check: `GET /healthz`
   - User Management: `GET /v1/user/self`

## Packer Integration

To create a machine image using Packer:

1. **Install Packer Plugins**:
   ```bash
   packer plugins install github.com/hashicorp/googlecompute
   ```

2. **Initialize Packer**:
   ```bash
   packer init .
   ```

3. **Validate the Packer Template**:
   ```bash
   packer validate webappImage.json
   ```

4. **Build the Image**:
   ```bash
   packer build webappImage.json
   ```

5. **Assign IAM Policy**:
   Replace `csye-6225-tarun-002294529` with your project ID:
   ```bash
   gcloud projects add-iam-policy-binding csye-6225-tarun-002294529 \
     --member=serviceAccount:image-builder@csye-6225-tarun-002294529.iam.gserviceaccount.com \
     --role=roles/compute.imageUser
   ```

## Additional Commands

- **Update Google Cloud Components**:
  ```bash
  gcloud components update
  ```

- **Revert Google Cloud Components to a Specific Version**:
  ```bash
  gcloud components update --version 463.0.0
  ```

- **Upgrade Packer Template to HCL2**:
  ```bash
  packer hcl2_upgrade -with-annotations webappImage.json
  ```

- **Validate Packer Template with Variables**:
  ```bash
  packer validate \
    -var 'project_id=csye-6225-tarun-002294529' \
    -var 'zone=us-east1-b' \
    -var 'image_name=csye6225-image-a3' \
    -var 'credentials_file=credentials.json' \
    -var 'source_image=centos-stream-8-v20240110' \
    webappImage.json.pkr.hcl
  ```

- **Check Google Cloud Ops Agent Status**:
  ```bash
  sudo systemctl status google-cloud-ops-agent
  ```

## Notes

- Ensure that the PostgreSQL server is running and accessible.
- Update the `.env` file with your specific database credentials.
- Regularly monitor the health endpoint to maintain optimal application performance.

For more detailed information, refer to the [Express.js](https://expressjs.com/), [Sequelize](https://sequelize.org/), and [Packer](https://www.packer.io/) official documentation. 
