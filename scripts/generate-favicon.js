/**
 * SwarmAI.chat Favicon Generator
 * 生成不同尺寸的favicon图标
 */

const fs = require('fs');
const path = require('path');

// SVG图标定义
const createSwarmAISVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="gradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#a5b4fc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#c4b5fd;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 背景圆形 -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#gradient)" />
  
  <!-- 中心AI核心 -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/6}" fill="#ffffff" opacity="0.9" />
  
  <!-- 围绕的小圆点代表智能体 -->
  <circle cx="${size/2 + size/3.5}" cy="${size/2}" r="${size/12}" fill="url(#gradientLight)" />
  <circle cx="${size/2 - size/3.5}" cy="${size/2}" r="${size/12}" fill="url(#gradientLight)" />
  <circle cx="${size/2}" cy="${size/2 + size/3.5}" r="${size/12}" fill="url(#gradientLight)" />
  <circle cx="${size/2}" cy="${size/2 - size/3.5}" r="${size/12}" fill="url(#gradientLight)" />
  
  <!-- 连接线显示协作关系 -->
  <line x1="${size/2}" y1="${size/2}" x2="${size/2 + size/3.5}" y2="${size/2}" stroke="#ffffff" stroke-width="2" opacity="0.7" />
  <line x1="${size/2}" y1="${size/2}" x2="${size/2 - size/3.5}" y2="${size/2}" stroke="#ffffff" stroke-width="2" opacity="0.7" />
  <line x1="${size/2}" y1="${size/2}" x2="${size/2}" y2="${size/2 + size/3.5}" stroke="#ffffff" stroke-width="2" opacity="0.7" />
  <line x1="${size/2}" y1="${size/2}" x2="${size/2}" y2="${size/2 - size/3.5}" stroke="#ffffff" stroke-width="2" opacity="0.7" />
</svg>
`;

// 创建不同尺寸的SVG文件
const sizes = [16, 32, 96, 180, 192, 512];
const publicDir = path.join(process.cwd(), 'public');

// 确保public目录存在
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 生成SVG文件
sizes.forEach(size => {
  const svgContent = createSwarmAISVG(size);
  const filename = `favicon-${size}x${size}.svg`;
  const filepath = path.join(publicDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Generated: ${filename}`);
});

// 生成特殊尺寸文件
const appleTouchIcon = createSwarmAISVG(180);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.svg'), appleTouchIcon);
console.log('✅ Generated: apple-touch-icon.svg');

const androidChrome192 = createSwarmAISVG(192);
fs.writeFileSync(path.join(publicDir, 'android-chrome-192x192.svg'), androidChrome192);
console.log('✅ Generated: android-chrome-192x192.svg');

const androidChrome512 = createSwarmAISVG(512);
fs.writeFileSync(path.join(publicDir, 'android-chrome-512x512.svg'), androidChrome512);
console.log('✅ Generated: android-chrome-512x512.svg');

// 创建基础favicon.ico使用的SVG
const faviconSVG = createSwarmAISVG(32);
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSVG);
console.log('✅ Generated: favicon.svg');

console.log(`
🎉 SwarmAI.chat favicon图标生成完成！

生成的文件：
${sizes.map(size => `- favicon-${size}x${size}.svg`).join('\n')}
- apple-touch-icon.svg
- android-chrome-192x192.svg  
- android-chrome-512x512.svg
- favicon.svg

💡 如需PNG格式，请使用在线转换工具或图像处理软件将SVG转换为PNG。

🔗 推荐工具：
- https://convertio.co/svg-png/
- https://cloudconvert.com/svg-to-png
- 或使用Figma、Sketch等设计工具
`); 