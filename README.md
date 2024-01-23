AUI
===

The Atlassian User Interface library.

Requirements
------------

- Java 1.7 - for building the soy templates.
- Node 0.10
- NPM

Installation
------------

NPM install takes care of everything for you.

    npm install

Building
--------

To build the distribution:

    grunt build

Running tests
-------------

We use [Karma](http://karma-runner.github.io/0.10/index.html) for running our [Qunit](http://qunitjs.com/) tests.

To run tests in watch mode:

    grunt test-debug

To run tests over the built distribution instead of the source files:

    grunt test-dist

To test with a specific version of jquery, run:

    bower install jquery#[jquery-version]

before running tests. jQuery 1.7.2 and 1.8.3 are supported.

Linting && Coding Style Checks
------------------------------

AUI uses its own subset of the [JSHint](http://jshint.com) and [JSCS](https://github.com/mdevils/node-jscs) rules. To run both of these:

    grunt lint

To lint individual files as they are modified run:

    grunt watch:lint

Commands
--------

To see a wider range of Grunt commands run:

    grunt

How do you get it?
------------------

AUI distributions are released to the [aui-dist repo on Bitbucket](https://bitbucket.org/atlassian/aui-dist).

Additional documentation
------------------------
* [Component documentation](https://docs.atlassian.com/aui/latest/)
* [Sandbox Tool](https://docs.atlassian.com/aui/latest/sandbox/)
* [Release Notes](https://developer.atlassian.com/display/AUI/AUI+Release+Notes)

Raising issues
--------------

Raise bugs or feature requests in the [AUI project](https://ecosystem.atlassian.net/browse/AUI).

Contributing
------------

Contributions to AUI are via pull request.

- Create an issue in the [AUI project](https://ecosystem.atlassian.net/browse/AUI). Creating an issue is a good place to
talk the AUI team about whether anyone else is working on the same issue, what the best fix is, and if this is a new feature,
whether it belongs in AUI. If you don't create an issue, we'll ask you to create one when you issue the PR and retag your
commits with the issue key.
- If you have write access to the AUI repo (ie if you work at Atlassian), you can create branches in the main AUI repo -
name your branch as `issue/{issue-key}-{description}`, eg `issue/AUI-1337-fix-the-contributor-guide`. If you don't have
write access, please fork AUI and issue a PR.
- Ensure all commits are tagged with the issue key (`AUI-1337 fixes to contributor guide`).
- Write tests. Unit tests are preferred over integration tests.
- Most PRs will go into master, however you might want them to go into a stable branch. If so, set the target branch
as the stable branch and the AUI team will manage merging stable into master after the PR is through.

Compatibility
-------------

AUI supports the following browsers:

- Chrome latest stable
- Firefox latest stable
- Safari latest stable (on OS X only)
- IE 9 / 10

License
-------

AUI is released under the [Apache 2 license](https://bitbucket.org/atlassian/aui/src/master/licenses/LICENSE-aui.txt).
See the [licenses directory](https://bitbucket.org/atlassian/aui/src/master/licenses/) for information about AUI and included libraries.
