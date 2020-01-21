# Simulating user DOM interaction in Angular unit tests
<a href="https://github.com/crappylime/angular-test-typeahead/commits/master"><img src="https://img.shields.io/github/last-commit/crappylime/angular-test-typeahead.svg?style=plasticr"/></a>
[![license](https://img.shields.io/github/license/crappylime/angular-test-typeahead.svg)](https://github.com/crappylime/angular-test-typeahead/blob/master/LICENSE)

Many components have complex interactions with the DOM elements described in their templates, causing HTML to appear and disappear as the component state changes, for example:
- autocomplete / typeahead,
- timepicker / datepicker,
- tables sorting / filtering / pagination.

I will test here the user DOM interaction with the sample search component - an enhanced version of the [Angular Material Autocomplete]().
Check out this project on [stackblitz](https://stackblitz.com/github/crappylime/angular-test-typeahead).

## Table of contents
  - [Motivation](#motivation)
  - [Built With](#built-with)
  - [Getting Started](#getting-started)
  - [Triggering events on elements](#triggering-events-on-elements)
  - [Async tests](#async-tests)
  - [Interacting with Input Boxes](#interacting-with-input-boxes)
  - [Test 'cases' pattern](#test-cases-pattern)
  - [License](#license)
  - [Credits](#credits)

## Motivation
> But a component is more than just its class. A component interacts with the DOM and with other components. The class-only tests can tell you about class behavior. They cannot tell you if the component is going to render properly, respond to user input and gestures, or integrate with its parent and child components.
>
> None of the class-only tests above can answer key questions about how the components actually behave on screen.
>
>To answer the key questions about how the components actually behave on screen, you have to create the DOM elements associated with the components, you must examine the DOM to confirm that component state displays properly at the appropriate times, and you must simulate user interaction with the screen to determine whether those interactions cause the component to behave as expected.
>
> -- <cite>[Angular Testing Guide | Component DOM Testing](https://angular.io/guide/testing#component-dom-testing)</cite>

## Built With

* [Angular v. 8.2.9](https://angular.io) - The web framework used
* [Node.js v. 10.16.3](https://nodejs.org) - JavaScript runtime built
* [NPM v. 6.9.0](https://www.npmjs.com) - Dependency Management
* [Karma v. 4.1.0](https://karma-runner.github.io/) - Test Runner
* [Jasmine v. 3.4.0](https://jasmine.github.io/) - Testing Framework

## Getting Started

<details><summary><b>Show instructions on how to get a copy of the project up and running on your local machine</b></summary>

### Prerequisites
* [VS Code](https://code.visualstudio.com) (you will get extensions that I recommend) or other IDE
* [Node.js v. 10.16.3](https://nodejs.org) or higher

### Installing
1. Clone repo

    ```sh
    $ git clone https://github.com/crappylime/angular-test-typeahead.git
    ```

2. Go to the project root

    ```sh
    $ cd angular-test-typeahead 
    ```

3. Install dependencies

    ```sh
    $ npm i
    ```

4. Run tests

    ```sh
    $ npm test
    ```
</details>

## Triggering events on elements

## Async tests

- **fakeAsync vs async**

- **tick vs flush**

## Interacting with Input Boxes

## Test 'cases' pattern

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Credits

* [Angular Testing Guide](https://angular.io/guide/testing)
* test 'cases' pattern from [Zack DeRose](https://blog.angularindepth.com/how-i-was-completely-wrong-about-setting-up-tearing-down-tests-d3f6501d1718)
