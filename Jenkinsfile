pipeline {
    agent any

    environment {
        APP_NAME = 'tasklist-frontend'
        DOCKER_IMAGE = 'sohane95/tasklist-frontend'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        VITE_API_URL = '/api'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Unit tests') {
            steps {
                sh 'mkdir -p reports coverage'
                sh 'npm run test:coverage'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'reports/junit.xml'
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Frontend Coverage Report'
                    ])
                }
            }
        }

        stage('Security - npm audit') {
            steps {
                sh 'npm audit --audit-level=high || true'
            }
        }

        stage('Security - Trivy filesystem') {
            steps {
                sh 'trivy fs --severity HIGH,CRITICAL --exit-code 0 .'
            }
        }

        stage('SonarQube analysis') {
            steps {
                withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                    withSonarQubeEnv('SonarQube') {
                        sh 'sonar-scanner -Dsonar.token=$SONAR_TOKEN'
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build application') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker build') {
            steps {
                sh """
                    /usr/bin/docker build \
                      --build-arg VITE_API_URL=${VITE_API_URL} \
                      -t ${DOCKER_IMAGE}:${IMAGE_TAG} \
                      -t ${DOCKER_IMAGE}:latest \
                      .
                """
            }
        }

        stage('Security - Trivy image') {
            steps {
                sh "trivy image --severity HIGH,CRITICAL --exit-code 0 ${DOCKER_IMAGE}:${IMAGE_TAG}"
            }
        }

        stage('Generate SBOM') {
            steps {
                sh """
                    syft packages docker:${DOCKER_IMAGE}:${IMAGE_TAG} -o spdx-json > sbom-spdx.json
                """
                archiveArtifacts artifacts: 'sbom-spdx.json', fingerprint: true
            }
        }

        stage('Push Docker image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | /usr/bin/docker login -u "$DOCKER_USER" --password-stdin
                        /usr/bin/docker push ${DOCKER_IMAGE}:${IMAGE_TAG}
                        /usr/bin/docker push ${DOCKER_IMAGE}:latest
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline frontend termine avec succes."
        }
        failure {
            echo "Pipeline frontend en echec."
        }
        always {
            cleanWs()
        }
    }
}
