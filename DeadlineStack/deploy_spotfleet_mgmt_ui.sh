#!/bin/sh

# Script parameters for AWS account, region, and profile
while getopts a:r:p: flag; do
  case "${flag}" in
  a)
    AWS_ACCOUNT=${OPTARG}
    ;;
  r)
    REGION=${OPTARG}
    ;;
  p)
    PROFILE=${OPTARG:-default}
    ;;
  *) echo "Invalid option: -$flag" ;;
  esac
done

# Function to create ECR repository if it doesn't exist
create_ecr_repo() {
  repo_name="spotfleet-mgmt-ui"
  echo "Checking if the ECR repository '${repo_name}' exists..."

  if ! aws ecr describe-repositories --region "${REGION}" --repository-names "${repo_name}" > /dev/null 2>&1; then
    echo "Repository does not exist. Creating '${repo_name}' repository..."
    aws ecr create-repository --region "${REGION}" --repository-name "${repo_name}"
  else
    echo "Repository '${repo_name}' already exists. Skipping creation."
  fi
}

# Create the ECR repository
create_ecr_repo

# Define repository URL
SpotfleetMgmtUiRepository="${AWS_ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com/spotfleet-mgmt-ui"

# Build the Docker image for spotfleet-mgmt-ui
echo "Building the spotfleet-mgmt-ui Docker image..."
docker build -t "${SpotfleetMgmtUiRepository}":latest ./spotfleet-mgmt-ui

# Login to AWS ECR
echo "Logging in to AWS ECR..."
aws ecr get-login-password --region "${REGION}" | docker login --username AWS --password-stdin "${AWS_ACCOUNT}".dkr.ecr."${REGION}".amazonaws.com

# Push the image to the ECR repository
echo "Pushing the spotfleet-mgmt-ui image to ECR..."
docker push "${SpotfleetMgmtUiRepository}":latest

# Output the Docker image URI
echo "Docker image pushed successfully."
echo "Docker Image URI: ${SpotfleetMgmtUiRepository}:latest"
