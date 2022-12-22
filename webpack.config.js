const fs = require('fs');
const { readdir } = require('fs').promises;
const glob = require('glob');
const path = require('path');
const publicPath = 'https://static.wemade.com/test-webpack/'; // cdn 업로드 경로
const targetDirectory = './app/';


async function* getFiles(directory) {
  const dirents = await readdir(directory, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = path.resolve(directory, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

module.exports = async (env, options) => {
  let tempArray = [];
  let entryArray = [];
  let entryMap = {};
  
  // targetDirectory내부의 모든 파일들을 배열에 담는다.
  for await (const file of getFiles(targetDirectory)) {
    tempArray.push(file);
  }

  tempArray = tempArray
    // HTML파일만 필터링하고
    .filter(file => {
      return file.match(/.*\.html$/);
    })
    // webpack entry 리스트(object)를 생성한다.
    .forEach(file => {
      const values = [
        file,
        // file.replace('.html', '.js'),
      ];
      // entryMap[file.replace(/\.html$/, '').split('\\')[file.replace(/\.html$/, '').split('\\').length - 1]] = values;

      entryArray.push(file);
    });

  console.log('Webpack Entry', entryArray);

  return {
    mode: 'development',
    entry: {
      index: entryArray
    },
    output: {
      path: path.join(__dirname, `dist`),
      filename: `[name].js`,
    },
    module: {
      rules: [
        // HTML
        {
          test: /\.html$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'html/[name].html'
              }
            },
            'extract-loader',
            {
              loader: "html-loader",
              options: {
                attrs: ["img:src", "link:href"]
              }
            }
          ]
        },
  
        // CSS
        {
          test: /\.css$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: `[name].css`
              }
            },
            // should be just "extract-loader" in your case
            'extract-loader',
            {
              loader: "css-loader",
              options: {
                sourceMap: true
              }
            }
         ]
        },
  
        // Images
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: `[name]-[hash].[ext]`
              },
            }
          ]
        },
      ]
    },
    output: {
      publicPath,
    },
  };
}

