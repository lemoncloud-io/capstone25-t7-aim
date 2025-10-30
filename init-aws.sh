#!/bin/bash

# Usage:
#  - For LocalStack testing: USE_LOCALSTACK=true ./init-aws.sh
#  - For real AWS: configure AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY/AWS_DEFAULT_REGION and run ./init-aws.sh

S3_BUCKET=${S3_BUCKET:-aim-deploy-bucket}
AWS_REGION=${AWS_DEFAULT_REGION:-ap-northeast-2}

echo "--- 🚀 S3 초기화 스크립트 시작 (버킷 생성) 🚀 ---"

if [ "$USE_LOCALSTACK" = "true" ]; then
    echo "로컬테스트 모드: LocalStack을 사용합니다. (USE_LOCALSTACK=true)"
    # LocalStack이 설치되어 있고 `awslocal` 명령을 사용 가능해야 합니다.
    export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-test}
    export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-test}
    export AWS_DEFAULT_REGION=${AWS_REGION}
    awslocal s3api create-bucket \
        --bucket ${S3_BUCKET} \
        --region ${AWS_REGION} \
        --create-bucket-configuration LocationConstraint=${AWS_REGION} \
        || echo "Bucket '${S3_BUCKET}' already exists."
else
    echo "실제 AWS 모드: AWS CLI를 사용합니다. 환경변수 AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY/AWS_DEFAULT_REGION을 설정하세요."
    # Create bucket using aws cli. Requires proper IAM permissions and region.
    aws s3api create-bucket \
        --bucket ${S3_BUCKET} \
        --region ${AWS_REGION} \
        --create-bucket-configuration LocationConstraint=${AWS_REGION} \
        || echo "Bucket '${S3_BUCKET}' already exists or creation failed. Check AWS credentials/permissions."
fi

echo "✅ S3 '${S3_BUCKET}' 버킷 준비 완료."
echo "--- 🚀 S3 초기화 스크립트 종료 🚀 ---"