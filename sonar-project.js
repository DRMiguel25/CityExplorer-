const scanner = require('sonarqube-scanner');

const token = '48|8JV7t0cKzZj35UcjozFBauw0zauKt6tJ5kBBYxXs55b34292';

scanner(
  {
    serverUrl: 'http://localhost:9000',
    token: token,
    options: {
      'sonar.projectKey': 'CityExplorer_Angular',
      'sonar.projectName': 'CityExplorer Angular',
      'sonar.projectVersion': '1.0',
      'sonar.sources': 'src',
      'sonar.exclusions': '**/node_modules/**,**/dist/**,**/*.spec.ts',
    },
  },
  () => process.exit()
);
