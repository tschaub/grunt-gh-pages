# grunt-gh-pages
**Publish to GitHub Pages with Grunt**

Use [Grunt](http://gruntjs.com/) to push to your `gh-pages` branch hosted on GitHub or any other branch anywhere else.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-gh-pages --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-gh-pages');
```

## The "gh-pages" task

### Overview
In your project's Gruntfile, add a section named `gh-pages` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  'gh-pages': {
    options: {
      // Task-specific options go here.
    },
    repo: 'git@github.com:user/repo.git',
    src: ['index.html', 'js/**/*', 'css/**/*', 'img/**/*']
  }
})
```

### Options

The default task options should work for most cases.  The options described below let you push to alternate branches, customize your commit messages, and more.

#### options.git
Type: `String`
Default value: `'git'`

Your `git` executable.

#### options.clone
Type: `String`
Default value: `'.grunt/grunt-gh-pages/gh-pages/repo'`

Path to a directory where your repository will be cloned.  If this directory doesn't already exist, it will be created.  If it already exists, it is assumed to be a clone of your repository.  If you stick with the default value (recommended), you will likely want to add `.grunt` to your `.gitignore` file.

#### options.branch
Type: `String`
Default value: `'gh-pages'`

The name of the branch you'll be pushing to.  The default uses GitHub's `gh-pages` branch, but this same task can be used to push to any branch on any remote.

#### options.remote
Type: `String`
Default value: `'origin'`

This only needs to be set if you are not using the default `options.clone` value and you have a clone already configured with a different remote name.

#### options.message
Type: `String`
Default value: `'Updates'`

The commit message for all commits.
