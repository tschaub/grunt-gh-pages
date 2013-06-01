# options

<a href="#base" id="base">
## `options.base`
</a>

 * type: `String`
 * default: `process.cwd()`

The `base` option provides the path to the directory for all of your `src` files.  By default, the `src` files in your `gh-pages` task configuration are assumed to be relative to the current working directory.  When the task adds these files to the target branch, they will be added with the same relative path.

For example, say you have the following directory layout:

    project/
      gruntfile.js
      files/
        index.html

Assume the following task configuration:

```js
'gh-pages': {
  src: 'files/index.html'
}
```

In this case, running `grunt gh-pages` will copy the `files/index.html` file and add it to your `gh-pages` branch with the same relative path (so it might be hosted at `http://you.github.io/project/files/index.html`).

If instead you want to have this file added *without* the `files` part of the path, set the `base` option and alter the `src` in your task configuration as follows:

```js
'gh-pages': {
  options: {
    base: 'files'
  },
  src: 'index.html'
}
```

With the above configuration, running `grunt gh-pages` would copy the `files/index.html` file and add it to your `gh-pages` branch as `index.html` (in this case it might be hosted at `http://you.github.io/project/files/index.html`).
