# RP Navi Style Guide

## JavaScript

### Safety

While this project doesn't aim to have MISRA-C or NASA's Power of Ten levels of safety, making sure data is handled properly is still the essence of a reliable system. To that end...

-   **Declare variables at the closest possible scope**

    This ensures that data is only used where it's actually necessary. In addition, it gives the best context where that data's being used.

-   **Don't pull object members out into local-scope variables**

    e.g., don't do this

    ```JavaScript
        function (dataObject) {
            const foobar = dataObject.foobar;
            const fizzbuzz = dataOjbect.fizzbuzz;
        }
    ```

    This can create confusion as to where the data came from. This also minimizes the number of variables in a scope, which means less things to keep track of.

-   **`const` should be the default**

    Take a page from Rust: unless there's a reason for the variable to be mutable, it should be const. Similarly, use `Object.freeze()` as needed.

-   **Avoid negative expressions**

    Negatives are hard to deal with. Especially if the name is something negative. `!not_a_thing` means it's a thing, but the name says it's not!

-   **There's no such thing as a truly optional parameter**

    One of the worst things that can happen in JavaScript is a variable that has the value `undefined`. All data, even if it's optional to use, should have a default value tied to it.

-   **Conditional statements must resolve to a boolean**

    JavaScript has a reputation for a convoluted "truthy" system. Thus, explicitly state what you're testing. If `foobar` is a string, test if it contains something by using `if (foobar.length > 0)` instead of `if (foobar)` since foobar is not a boolean. In addition, prefer `===` over `==` to avoid implicit conversion where possible.

-   **All control flow statements must have braces**

    This allows expansion of the contents of the control flow statement without needing to think about adding braces. In addition, it provides a clear delination of what's happening in that path.

-   **Prefer string templates**

    String templates allow the use of `'` and `"` without needing to worry about escaping the character, or deciding which one is more important to avoid needing to escape.

-   **Follow YAGNI, to a point**

    Don't make something unless it's actually needed.

-   **Import only what's needed from a module**

    Though for practicality's sake, if you reallly need more than four things from a module, go ahead and import the whole module.

### Style Consistency

#### Naming

-   **Nouns for variables, verbs for functions**

    This helps describe what a variable is and what a function does before comments are needed.

-   **camelCase for variable and data member names**

    With JavaScript, camelCase is the most common naming standard. Since this codebase relies on dependencies, it would look weird to mix naming styles.

-   **PascalCase for function, method, class, and data structure names**

    Makes it easier to see at a glance what's what.

-   **Do not abbrivate names**

    If abbreviation is done to shorten a name, then it's time to 1. rethink how to describe the thing being named and/or 2. break out the thesaurus.

-   **Maintain capitalization for acronyms**

    Because `Json` looks odd when it's `JSON`

### Spacing

-   **Tabs for indentation, spaces for alignment**

    Tabs are customizable, though the code was developed using 4-space tabs. Plus some IDEs don't space based indentation as indents, so you have to move the cursor keys over the spaces

-   **Lines stop at 120 characters**

    80 characters was simply a limitation of old text based editors. Obviously there shouldn't be lines that are too long and 120 characters can fit comfortably(ish) in a 1280px wide window.

-   **Left curly brace starts on the same line as the control flow statement**

    So for every `function`, `if`, `for`, `while`, and others, add the `{` on the same line.

-   **Have a space around the outside of parenthesis pairs, but not within them**

    Examples of good and bad cases

    ```JavaScript
        // GOOD
        if (condition) {
            // Do something...
        }

        // ALSO GOOD
        if (condition && another_condition) {
            // Do something...
        }

        // BUT NOT GOOD
        if(condition) {
            // Do something...
        }

        // ALSO NOT GOOD
        if( condition && another_condition ) {
            // Do something...
        }
    ```

-   **Have a space around operator characters**

    For example, don't do this: `let foobar=123+456/fizzbuzz;`
    But do this: `let foobar = 123 + 456 / fizzbuzz;`

#### Organization

-   **Consider DRY judiciously**

    If things are being done in the same exact manner with the same parameters, then maybe consider DRY.

-   **End all statements with a semicolon**

    This prevents ambiguity on where something ends.

-   **Sort function parameters either by order of use or alphabetically**

    One helps support sayin when the parameter will be used in the function. The other is a convenient sorting method.

-   **Prefer function flow of error checking, then success logic**

    When verifying what's going on, prefer to return early as much as possible. The last thing that should be done is the actual logic of the function (or "happy path" in some parlences)

These are just here to remind me of the separation of concerns with the architecture.

-   **Routers should have no logic in them**

    Their only purpose is to register the URL + HTTP method to the appropriate Controller method.

-   **Controllers should not modify the data via business rules**

    That's not their job.

## HTML/CSS

-   **Naming convention**

    Use kebab-case for naming all IDs, classes, and attributes.

-   **Indentation**

    Use tabs for indentation, spaces for alignment

-   **Use double quotes `"`**

    If something requires quotes to identify something, use double quotes.
