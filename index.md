# Kewl React and Redux Stuff

* Dis gonna be pretty technical
* But there will also be some useful theoretical concepts too
* -that I stole from smarter people

---

# Disclaimer

Opinions are my own and not necessarily that of my employer the Weyland Yutani Corporation.

---

# Disclaimer Numero Duo

There's still alot of debate about best practices and techniques for React and Redux

I `<3` talking about functional programming, so talk to me about this stuff pls!

<small>I'm so lonely...</small>

---

# The DOM

1. It's a JavaScript representation of what's currently on the page. When you manipulate
the DOM the browser will then manipulate what it's showing accordingly.

Everything you see on the browser is an element, that generally has three things

1. A type
2. Attributes
3. Children

Something something polymorphism

---

# The virtual dom

There are many different implementations but they all have a similar overarching flow

1. Creates an initial vdom tree (just a POJO really)
2. walks down the POJO doing document.createElement calls, appends the final element
3. On update, creates a shiny new vnode tree
4. "Diffs" the vdom against the real dom and patches it

---

# Create an initial vnode tree

```
function (props) {
  return
    <div id="hi">
      <h3>{props.message}</h3>
      <ul>
        <li>one</li>
        <li>two</li>
      </ul>
    </div>
}
```

```
function (props) {
  return
    React.createElement(
      'div',
      {id: 'hi'},
      React.createElement('h3', {}, props.message)
      React.createElement(
        'ul',
        {},
        React.createElement('li', {}, 'one'),
        React.createElement('li', {}, 'two')
      )
    )
}
```

---

# React.createElement makes a POJO out of its args
This is actually super simplified, what React makes has alot more fluff
and stuff on the object.
```
{ type: 'div',
  attributes: {id: 'hi'},
  children: [
    { type: 'h3',
      attributes: {},
      children: [ { type: 'textNode', text: "IM A MESSAGE" } ]
    }
    { type: 'ul',
      attributes: {},
      children: [
        { type: 'li',
          attributes: {},
          children: [ { type: 'textNode', text: 'one' } ]
        },
        { type: 'li',
          attributes: {},
          children: [ { type: 'textNode', text: 'two' }]
        }
      ]
    }
  ]
}
```

---

# Using this stuff to render stuff

Once again, React has alot more ceremony around this...

```
function render(vnode, element) {
  if (vnode.type === 'textNode')
    return element.appendChild(document.createTextNode(vnode.text))

  // create a the element
  const el = document.createElement(vnode.type)

  // give it some attributes
  Object.keys(vnode.attributes).forEach(attributeName => {
    el.setAttribute(attributeName, vnode.attributes[attributeName])
  })

  // render the children
  vnode.children.forEach(child => render(child, el))

  // mount
  element.appendChild(el)
}
```

---

# Diffing and Patching!

On each new render another vdom is created. It then walks down this vdom, which is
parallel to the real dom after the first render, so as it finds discrepencies between the
vdom and the real dom it patches appropriately.

---

# Virtual DOM

There's a ton of virtual dom libraries out there like React. They all work pretty
similar.

* Cycle
* Mithril
* Preact
* Inferno
* Choo
* Yo-Yo
* Elm
* HyperApp
* Marko

---

# The synthetic event system!

Here's an input that doesn't work

https://codepen.io/abradley2/pen/GMVQgQ?editors=1010

Here's one that does work though!

https://codepen.io/abradley2/pen/qPexZr?editors=1010

And now let's make the latter example not work by forcing a re-render

https://codepen.io/abradley2/pen/KXOQWO?editors=1010

---

#  Patching in action!

https://codepen.io/abradley2/pen/MENQra?editors=0010

---

# The Redux Pattern in a nutshell

https://martinfowler.com/eaaDev/EventSourcing.html

>>> _"Event Sourcing ensures that all changes to application state are stored as a sequence of events. Not just can we query these events, we can also use the event log to reconstruct past states, and as a foundation to automatically adjust the state to cope with retroactive changes."_

Redux is pretty close to event-sourcing

---

_"If you've used any VCS you've used event sourcing"_

---

# "Actions"

>>> _"We went with what's familiar to the target audience.
The original target audience of Redux were Flux developers,
so we considered it important to keep the Flux meaning of “action”._

https://github.com/reactjs/redux/issues/891#issuecomment-147666329


---

# Wat an "action" looks like

```
{
  type: "BUTTON_PRESSED",
  buttonWasBlue: true
}
```

They're more nouns than verbs really

https://github.com/reactjs/redux/issues/384

---

# "Sequence of events/actions"

```
const initialState = {
  message: 'hi',
  toggle: false
}

const actions = [
  { type: 'SET_MESSAGE', newMessage: 'hi there' },
  { type: 'TOGGLE_THING', toggleTo: true }
]

function reducerFunc(state, action) { ... }

const finalState = actions.reduce(reducerFunc, initialState)
```

---

# What a reducer looks like

```
const {set} = require('icepick')

function (state, action) {
  // we generally use a convention for categorizing actions so we can

  switch(action.type) {
    case "NEW_MESSAGE":
      return set(state, 'message', action.newMessage)
    case "TOGGLE_INVERTED":
      return set(state, 'toggle', !state.toggle)
    default:
      return state
  }
}
```
---

Notice above we don't mutate state, we rather we return a new copy.

---

But we cheat! Since the main benefit of "create new, don't mutate" is diffs,
then the only thing we need to be immutable are those parts of state we touch.

<hr />

Therefore we can be "immutable, but performant" because we aren't _really_
throwing away the entire structure.

https://github.com/markerikson/redux-ecosystem-links/blob/master/immutable-data.md#immutable-update-utilities

---

# Patches!

```
var a = [
  { name: 'a' },
  { name: 'b' },
  { name: 'c' },
]

var b = a.slice();
b.splice(1, 1);
b.push({ name: 'd' });

// Generate diff (ie JSON Patch) from a to b
var patch = jiff.diff(a, b);

// [{"op":"add","path":"/3","value":{"name":"d"}},{"op":"remove","path":"/1"}]
console.log(JSON.stringify(patch));

var patched = jiff.patch(patch, a);

// [{"name":"a"},{"name":"c"},{"name":"d"}]
console.log(JSON.stringify(patched));
```

https://github.com/cujojs/jiff

---

# Auditability

Mutating state is evil

---

Actions don't do anything themselves. Like events they're just
instructions coughed out into the void, and the reducer
can listen in create new state as they happen

---

# Treating actions as events

Don't dispatch a ton with every action

https://tech.affirm.com/redux-patterns-and-anti-patterns-7d80ef3d53bc

---

# Given an initial state, any series of events will produce

```
const {chain, setIn} = require('icepick');

test('checkout/traveler/edit', () => {
  const initialState = state;

  const expectedState = chain(state)
    .setIn(['travelers', 0, 'firstName'], 'Tony')
    .setIn(['travelers', 0, 'lastName'], 'Bradley')
    .value();

  // then create some actions we'll dispatch
  const result =
    [
      { type: 'checkout/traveler/edit',
        index: 0,
        key: 'firstName',
        value: 'Tony'
      },
      { type: 'checkout/traveler/edit',
        index: 0,
        key: 'lastName',
        value: 'Bradley'
      }
    ]
      .reduce(checkoutTravelersReducer, initialState);

  expect(result).toEqual(expectedState);
});
```

Not a unique concept right? Except the single atom pattern means all these
actions have a single path. There's no place where they can "hide" from us.

---

# Side effects!

It's actually easier to break the above pattern then you think!

```
function myReducer(state, action) {
  switch (action.type) {
    case 'CREATE_TODO':
      return state.todos.concat([
        {
          title: action.title,
          completed: false,
          dateCreated: Date.now()
        }
      ])
    default:
      return state
  }
}
```

---

# Impure functions!

A function is pure if it's output is a deterministic result of it's input,
and it does not mutate it's arguments.

If you only use pure function, this pattern is functional programming- this
get's overcomplicated alot....

```
let count = 0

export function getIncrement() {
  count += 1
  return count
}
```

---

# Purity only matters as part of the surface level api

This is weird but still pure
```
export function doubleAndAddTwo(input) {
  const doubleArg = input * 2

  function addTwo() {
    return doubleArg + 2
  }

  return addTwo()
}
```

---

Now think of the above, but for views

---

Just as state is a deterministic result of an initial state and all subsequent actions
dispatched...

Your view is a deterministic result of it's one and only argument- your state!

---

It's very convenient to have this assurance but-

scroll position, url and route params, mouse position, media queries, window size.

---

# When this paradigm breaks #1

You will almost definitely need to care about window size not matter how hard you fight it...

```
const tabletUpMq = window.matchMedia('(min-width: 600px)');
const desktopUpMq = window.matchMedia('(min-width: 960px)');

const initialState = {
  tableUp: false,
  desktopUp: false
}

function mediaReducer(state = initialState, action) {
  switch (action.type) {
    case 'TABLET_UP':
      return set(state, 'tabletUp', action.matches)
    case 'DESKTOP_UP':
      return set(state, 'desktopUp', action.matches)
    default:
      return state
  }
}

export const mediaSubscription = (dispatch) => {
  const checkTablet = () => {
    dispatch({ type: 'TABLET_UP', matches: tabletUpMq.matches });
  };

  const checkDesktop = () => {
    dispatch({ type: 'DESKTOP_UP', matches: desktopUpMq.matches });
  };

  tabletUpMq.addListener(checkTablet);
  desktopUpMq.addListener(checkDesktop);
};
```
---

If all that seemed like alot, a ton of people have implemented this pattern so npm
install or whateva

https://www.npmjs.com/package/redux-responsive
https://www.npmjs.com/package/redux-mediaquery

---

# When this paradigm breaks #1

https://formidable.com/blog/2016/07/11/let-the-url-do-the-talking-part-1-the-pain-of-react-router-in-redux/

* React Router assumes that certain “container” components should have a say in state architecture. Redux liberates your components from making any decisions about state.
* Mixing these responsibilities creates coupling between your state container and your view layer.

React Router is the most common break with this paradigm I generally see.

There are alternatives though!

https://www.npmjs.com/package/i40

https://www.npmjs.com/package/path-to-regexp

https://www.npmjs.com/package/redux-routing

---

## Keep the paradigm!

1. Subscribe to browser events, like link clicks and the `onpopstate` event. Not
different than putting an event handler like `onClick` or `onChange`
2. Parse the url into a json object
3. dispatch it as an action


https://github.com/abradley2/examples-react-redux-routing/blob/master/src/App.js
---

# I hate local component state

https://www.safaribooksonline.com/blog/2015/10/29/react-local-component-state/

Though it's often a necessary evil...

---

# Computed State

For the love of all that is holy don't do this

```
const initialState = {
  toggle: false,
  count: 2,
  doubleCount: 4
}

function countReducer(state = initialState, action) {
  switch (action.type) {
    case 'INCREMENT':
      return Object.assign({}, state, {
        count: state.count + 1,
        doubleCount: (state.count + 1) * 2
      })

    case 'ON_LINK_IN':
      return Object.assign({}, state, {
        count: action.queryParams.count,
        toggle: action.queryParams.toggle
      })
  }
}
```

---

# Use selectors instead!

```
const initialState = {
  toggle: false,
  count: 2,
}

export function doubleCount(state) {
  return state.count * 2
}

function countReducer(state = initialState, action) {
  switch (action.type) {
    case 'INCREMENT':
      return Object.assign({}, state, {
        count: state.count + 1,
      })

    case 'ON_LINK_IN':
      return Object.assign({}, state, {
        count: action.queryParams.count,
        toggle: action.queryParams.toggle
      })
  }
}
```

---

# Selectors are powerful

1. They make your state tree easier to navigate, you don't only need to use them
out of the above neccessity, they have value on their own.
2. You are always in sync. No running around keeping all state up do date with itself

---

# Memoize your selectors!

I will now _very_ strongly endorse Reselect   

https://github.com/reactjs/reselect/blob/master/src/index.js

---

```
import {
  emailIsInvalid,
  firstNameIsInvalid
} from '../reducer'

function view({state) {
  return <div>
    <input
      value={state.emailAddress}
      onInput={(e) => {
        dispatch({
          type: 'EMAIL_ADDRESS_CHANGED',
          newEmailAddress: e.target.value
        })
      }}
    />
    <span className="errorText">
      {
        emailIsInvalid(state.emailAddress)
          ? "This is not a valid email"
          : ""
      }
    </span>
  </div>
}
```

That selectors, as you might have guessed, is a regex. Memoize this!

---

When it is not a pure relationship, but it is a linked relationship, _aggressively_
keep that relationship up to date.

**Make illegal state unrepresentable**

https://github.com/PotomacInnovation/meo-frontend/pull/459/commits/8f66eb011412d6ed55c69b5f9443565b8907ca05

```
const initialState = {
  outboundFlight: null,
  returnFlight: null
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'OUTBOUND_SELECTED':
      return set(state, 'outboundFlight', action.newOutboundFlight)

    case 'RETURN_SELECTED':
      return set(state, 'returnFlight', action.newReturnFlight)

    case 'RETURN_DESELECTED':
      return set(state, 'returnFlight', null)

    default:
      return state
  }
}
```

---

# So what's the issue?

We now allow our events to create an illegal state if we don't send off the appropriate
ones every time.

The reducer should not allow illegal states to exist!

```
const initialState = {
  outboundFlight: null,
  returnFlight: null
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'OUTBOUND_SELECTED':
      return Object.assign({}, state, {
        outboundFlight: action.newOutboundFlight,
        returnFlight: null
      })

    case 'RETURN_SELECTED':
      return set(state, 'returnFlight', action.newReturnFlight)

    default:
      return state
  }
}
```

---

This anti-pattern can kill redux apps. If you do this alot you will find yourself
constantly having to do the correct dispatches in the correct order to maintain a
legal state.

Fortunately, it's _VERY_ easy to spot this and keep it out!
Anytime you find yourself dispatching a ton of events,
you are probably not having the reducer aggressively eliminate illegal states.

---

# Redux is also stupid simple

```
export const ActionTypes = {
  INIT: '@@redux/INIT'
}

export const combinReducers = map => (...args) => Object.keys(map).reduce((state, key) => {
  return Object.assign(state, { [key]: map[key](...args) });
}, {});

function bindActionCreator(actionCreator, dispatch) {
  return function() { return dispatch(actionCreator.apply(this, arguments)) }
}

export function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch)
  }

  const keys = Object.keys(actionCreators)
  const boundActionCreators = {}
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const actionCreator = actionCreators[key]
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
    }
  }
  return boundActionCreators
}

export function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}


export function applyMiddleware(...middlewares) {
  return (createStore) => (...args) => {
    const store = createStore(...args)
    let dispatch = store.dispatch
    let chain = []

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}

export function createStore(reducer, preloadedState, enhancer) {
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  if (typeof enhancer !== 'undefined') {
    return enhancer(createStore)(reducer, preloadedState)
  }

  let currentReducer = reducer
  let currentState = preloadedState

  function getState() {
    return currentState
  }

  function dispatch(action) {
    currentState = currentReducer(currentState, action)

    return action
  }

  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }

    currentReducer = nextReducer
    dispatch({ type: ActionTypes.INIT })
  }

  dispatch({ type: ActionTypes.INIT })

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
  }
}
```

---

# Suggestion: where to optimize

In the case of memoizing you are basically getting a free optimization.

Do all optimizations that have no cost to code readability before you do
optimizations that have a cost to code readability.

---

# Side effects

Server's are liars and not to be trusted

In redux we generally don't call this a "side effect" and assert it's purely functional

```
const someRequest = () => {
  return get('/some/json')
    .then((result) => {
      dispatch({
        type: 'GOT_JSON',
        dontGoJsonWaterfalls: result
      })
    })
}
```

You can use redux-thunk, redux-saga, or with redux-logic (I like redux-logic alot),
they all have the same issue- which is Redux only cares about "actions" not "effects"


Like the `Date.now()` example, resulting state is still a deterministic result of
the action dispatches, so long as any randomness happens as early as the action
and not in the reducer

---

# Alternative thoughts

In Elm, actions dispatches themselves must be deterministic.

No two actions can be dispatched differently given
1. The same event on the UI
2. The same UI appearing
3. The same state of the application

Redux doesn't really care about this, what is generally called "effects" in event
sourcing

---

Anytime an action dispatched from a UI event can be different even though the UI
is exactly the same and the state is exactly the smame (should be no difference anyhow)
this is an _effect_

Not just in the Elm architecture, but Redux-alikes like Vuex do this.

---

Why does the classification matter?

Because based on the classification as an effect the architecture can force you to define
what are _acceptable_ results of the effect- the query to your server, and force you to
dispatch a _different_ action on success or failure to meet that criteria.

---

# The Structure of a Redux App

Here you go
https://github.com/reactjs/redux/tree/master/examples/todomvc
