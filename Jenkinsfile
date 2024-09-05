pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh 'docker build -t api-image:${BUILD_NUMBER} .'
                echo 'remove running api container'
                sh 'docker stop api-container || true'
                sh 'docker rm api-container || true'
            }
        }
        stage('Deploy') {
            steps {
                sh 'docker run -d --name api-container -p 4000:4000 api-image:${BUILD_NUMBER}'
            }
        }
        stage('Cleanup') {
            steps {
                echo 'removing unused artifacts'
                sh 'docker system prune -af'
            }
        }
    }
}