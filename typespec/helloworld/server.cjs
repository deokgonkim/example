const express = require('express');
const path = require('path');
// const { pathToSwaggerUi } = require('swagger-ui-dist');
const swaggerUiAssetPath = require("swagger-ui-dist").getAbsoluteFSPath();

const app = express();
const port = 3000;

// 1. TypeSpec이 생성한 JSON 파일 경로 (본인의 경로에 맞게 수정)
const specPath = path.join(__dirname, 'tsp-output/schema/openapi.yaml');

// override swagger-initializer.js to load our spec
app.get('/swagger-initializer.js', (req, res) => {
  res.type('application/javascript');
  res.send(`
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "http://localhost:3000/spec",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  `);
});

// 2. Swagger UI 정적 파일 서빙
app.use(express.static(swaggerUiAssetPath));

// 3. OpenAPI Spec 파일 서빙 (CORS 허용)
app.use('/spec', express.static(specPath));

app.listen(port, () => {
  console.log(`Swagger UI 실행 중: http://localhost:${port}`);
});
