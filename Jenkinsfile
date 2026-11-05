// Jenkins pipeline for the Playwright tests.
// Works on both Windows and Linux Jenkins agents that have Node.js 18+ installed.
// Required Jenkins plugins: Pipeline, Git, JUnit, HTML Publisher.

pipeline {
  agent any

  options {
    timeout(time: 30, unit: 'MINUTES')
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  triggers {
    // Check GitHub for new commits every 5 minutes (use a webhook instead if Jenkins is reachable from GitHub)
    pollSCM('H/5 * * * *')
    // Also run every weekday at 9 AM as a regular health check of the site
    cron('H 9 * * 1-5')
  }

  environment {
    CI = 'true'
    // Cypress is in package.json too; skip its large binary download
    CYPRESS_INSTALL_BINARY = '0'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install dependencies') {
      steps {
        script {
          run 'node --version'
          run 'npm ci'
          run 'npx playwright install chromium'
        }
      }
    }

    stage('Run Playwright tests') {
      steps {
        script {
          run 'npx playwright test'
        }
      }
    }
  }

  post {
    always {
      junit allowEmptyResults: true, testResults: 'playwright/junit/results.xml'
      publishHTML(target: [
        reportName           : 'Playwright Report',
        reportDir            : 'playwright/report',
        reportFiles          : 'index.html',
        keepAll              : true,
        alwaysLinkToLastBuild: true,
        allowMissing         : true
      ])
      archiveArtifacts artifacts: 'playwright/test-results/**', allowEmptyArchive: true
    }
  }
}

// Run a shell command on Linux/macOS agents, or a batch command on Windows agents
def run(String cmd) {
  if (isUnix()) {
    sh cmd
  } else {
    bat cmd
  }
}
