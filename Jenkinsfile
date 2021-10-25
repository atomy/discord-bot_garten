pipeline {
    agent {
        label 'pi'
    }

    environment {
        APP_NAME = 'discord-bot-garten'
    }

    stages {
        stage('Build') {
            steps {
                withCredentials([string(credentialsId: 'iot-discord-bot-ecr-prefix', variable: 'ECR_PREFIX'),
                    string(credentialsId: 'iot-discord-bot-garten-discord-key', variable: 'DISCORD_KEY_GARDEN'),
                    string(credentialsId: 'discord-webhook-release-url', variable: 'DISCORD_WEBHOOK_URL')]) {
                        echo 'Configuring...'
                        sh './scripts/configure.sh'
                        echo 'Configuring...DONE'
                }

                sshagent (credentials: ['github-iogames-jenkins']) {
                    echo 'Auto-tagging...'
                    sh './scripts/auto-tag.sh'
                    echo 'Auto-tagging...DONE'
                }

                echo 'Building...'
                sh './scripts/build.sh'
                echo 'Building...DONE'
            }
        }

        stage('Push ECR') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', accessKeyVariable: 'AWS_ACCESS_KEY_ID', credentialsId: 'aws-ecr', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                    sh "aws configure set aws_access_key_id ${AWS_ACCESS_KEY_ID}"
                    sh "aws configure set aws_secret_access_key ${AWS_SECRET_ACCESS_KEY}"
                    sh '$(aws ecr get-login --no-include-email --region eu-central-1)'

                    echo 'Pushing ECR...'
                    sh './scripts/push.sh'
                    echo 'Pushing ECR...DONE'
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying....'
                sshagent(credentials : ['deploy-key-pi-relay']) {
                    sh './scripts/deploy.sh'
                }
                echo 'Deploying....DONE'
            }
        }
    }
}


