/* webpack.config.js */
const path = require('path');
var meta = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const name = "wan"

module.exports = {
  entry: {
	  index: './src/index.js',
  },
  plugins: [
      new HtmlWebpackPlugin({
		//inject:'head' ,
        title: "The Worldwide Air-Transportation Network",
		library: name,
  		template: './src/index.html',
		minify: false,  
  		anchor: name+"_container",
    	description: meta.description,
		scriptLoading: 'blocking'
      }),
	 // new BundleAnalyzerPlugin()
    ],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js',
  	  library: name,
      clean: false 
    }, 
  module: {
	  rules: [
	  	     {
	  	       test: /\.css$/,
	  	       use: [
	  	         "style-loader",
	  	         {
	  	           loader: "css-loader",
	  	           options: {
	  	             importLoaders: 1,
	  				   modules: {
	  					   localIdentName: '[hash:base64:5]__[local]',
	  				   },

	  	           },
	  	         },
	  	       ],
	  	       include: /\.module\.css$/,
	  	     },
	  	     {
	  	       test: /\.css$/,
	  	       use: ["style-loader", "css-loader"],
	  	       exclude: /\.module\.css$/,
	  	     },
	         {
	           test: /\.csv$/,
	           loader: 'csv-loader',
	           options: {
	             dynamicTyping: true,
	             header: true,
	             skipEmptyLines: true
	           }
	         },
			 {
			   test: /\.(png|svg|jpg|jpeg|gif)$/i,
			   use: [
			           {
			             loader: 'file-loader',
			           },
			         ],
			 },
	  	   ]
    },
	devServer: {
	    open: true,
	    watchFiles: ['src/**/*'],
	},
};

