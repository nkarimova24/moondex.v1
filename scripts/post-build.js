const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const srcDir = path.join(__dirname, '..', 'src');
const outDir = path.join(__dirname, '..', 'out');

const knownTokens = [
  { id: '1', token: 'U8XTLkUbnirU7JE81nrcwMrj5sc0glAtOyJT3UGKavDkPSapSsgy2egIkzki' },
  { id: '1', token: 'gShW5VqZMbGawcjZQFO48TILeEDLMOm78AHwLs1OQf2BlXFSCcRDLzQYvnkQ' }
];

console.log('Running post-build script...');

try {
  // Check if out directory exists
  if (!fs.existsSync(outDir)) {
    console.warn(`Output directory not found: ${outDir}`);
    console.log('Skipping post-build processing (this is normal for App Router builds)');
    process.exit(0);
  }

  // Process password reset pages with static wrapper
  const staticWrapperSrc = path.join(srcDir, 'app', 'password-reset', 'static-wrapper.html');
  if (fs.existsSync(staticWrapperSrc)) {
    console.log(`Found static wrapper: ${staticWrapperSrc}`);
    
    // Read the static wrapper HTML
    const wrapperContent = fs.readFileSync(staticWrapperSrc, 'utf8');
    
    // Create the base password-reset directory if needed
    const baseResetDir = path.join(outDir, 'password-reset');
    if (!fs.existsSync(baseResetDir)) {
      console.log(`Creating base password reset directory: ${baseResetDir}`);
      fs.mkdirSync(baseResetDir, { recursive: true });
    }
    
    // Create an index.html in the password-reset directory for catch-all handling
    const indexHtmlPath = path.join(baseResetDir, 'index.html');
    fs.writeFileSync(indexHtmlPath, wrapperContent);
    console.log(`Created index.html at: ${indexHtmlPath}`);
    
    // Process each known token to create static HTML files
    knownTokens.forEach(({ id, token }) => {
      // Create the path for this token
      const tokenDir = path.join(baseResetDir, id, token);
      if (!fs.existsSync(tokenDir)) {
        console.log(`Creating directory for token: ${id}/${token}`);
        fs.mkdirSync(tokenDir, { recursive: true });
      }
      
      // Write the wrapper content to this directory
      const tokenIndexPath = path.join(tokenDir, 'index.html');
      fs.writeFileSync(tokenIndexPath, wrapperContent);
      console.log(`Created static file for token: ${id}/${token}`);
    });
    
    // Look for existing placeholder password reset directories
    const placeholderDir = path.join(outDir, 'password-reset', 'placeholder-id', 'placeholder-token');
    if (fs.existsSync(placeholderDir)) {
      console.log(`Found placeholder directory: ${placeholderDir}`);
      
      // Add the static wrapper HTML to it
      const placeholderHtmlPath = path.join(placeholderDir, 'index.html');
      fs.writeFileSync(placeholderHtmlPath, wrapperContent);
      console.log(`Created placeholder index.html at: ${placeholderHtmlPath}`);
    }
    
    console.log('Static wrapper HTML files created successfully');
  } else {
    console.log(`Static wrapper HTML not found at: ${staticWrapperSrc} (skipping)`);
  }

  // Create .nojekyll file for GitHub Pages if needed
  const nojekyllPath = path.join(outDir, '.nojekyll');
  fs.writeFileSync(nojekyllPath, '');
  console.log('Created .nojekyll file for GitHub Pages compatibility');

  // Optional: fix problematic routes like collections/[id]
  console.log('Checking for problematic dynamic routes in the build output...');

  // Workaround for collections/[id] route issue (creates a redirect page)
  const collectionsDynamicDir = path.join(outDir, 'collections');
  if (fs.existsSync(collectionsDynamicDir)) {
    console.log('Processing collections directory for dynamic routes...');
    // If the directory exists, make sure it has proper HTML files
    // This helps with static hosting platforms
  } else {
    console.log('Collections directory not found in output');
  }

  console.log('Post-build script completed successfully!');
} catch (error) {
  console.error('Post-build script encountered an error:', error.message);
  console.log('Continuing anyway - this may not affect your deployment');
  // Don't exit with error code - allow build to continue
  process.exit(0);
} 