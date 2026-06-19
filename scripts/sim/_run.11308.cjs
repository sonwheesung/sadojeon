"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/zustand/esm/vanilla.mjs
var createStoreImpl, createStore;
var init_vanilla = __esm({
  "node_modules/zustand/esm/vanilla.mjs"() {
    "use strict";
    createStoreImpl = (createState) => {
      let state;
      const listeners = /* @__PURE__ */ new Set();
      const setState = (partial, replace) => {
        const nextState = typeof partial === "function" ? partial(state) : partial;
        if (!Object.is(nextState, state)) {
          const previousState = state;
          state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
          listeners.forEach((listener) => listener(state, previousState));
        }
      };
      const getState = () => state;
      const getInitialState = () => initialState;
      const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      };
      const api2 = { setState, getState, getInitialState, subscribe };
      const initialState = state = createState(setState, getState, api2);
      return api2;
    };
    createStore = ((createState) => createState ? createStoreImpl(createState) : createStoreImpl);
  }
});

// node_modules/react/cjs/react.production.js
var require_react_production = __commonJS({
  "node_modules/react/cjs/react.production.js"(exports2) {
    "use strict";
    var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element");
    var REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal");
    var REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment");
    var REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode");
    var REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler");
    var REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer");
    var REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context");
    var REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref");
    var REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense");
    var REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo");
    var REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy");
    var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
    function getIteratorFn(maybeIterable) {
      if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
      maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
      return "function" === typeof maybeIterable ? maybeIterable : null;
    }
    var ReactNoopUpdateQueue = {
      isMounted: function() {
        return false;
      },
      enqueueForceUpdate: function() {
      },
      enqueueReplaceState: function() {
      },
      enqueueSetState: function() {
      }
    };
    var assign = Object.assign;
    var emptyObject = {};
    function Component(props, context, updater) {
      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }
    Component.prototype.isReactComponent = {};
    Component.prototype.setState = function(partialState, callback) {
      if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
        throw Error(
          "takes an object of state variables to update or a function which returns an object of state variables."
        );
      this.updater.enqueueSetState(this, partialState, callback, "setState");
    };
    Component.prototype.forceUpdate = function(callback) {
      this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
    };
    function ComponentDummy() {
    }
    ComponentDummy.prototype = Component.prototype;
    function PureComponent(props, context, updater) {
      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }
    var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
    pureComponentPrototype.constructor = PureComponent;
    assign(pureComponentPrototype, Component.prototype);
    pureComponentPrototype.isPureReactComponent = true;
    var isArrayImpl = Array.isArray;
    var ReactSharedInternals = { H: null, A: null, T: null, S: null, V: null };
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function ReactElement(type, key, self, source, owner, props) {
      self = props.ref;
      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type,
        key,
        ref: void 0 !== self ? self : null,
        props
      };
    }
    function cloneAndReplaceKey(oldElement, newKey) {
      return ReactElement(
        oldElement.type,
        newKey,
        void 0,
        void 0,
        void 0,
        oldElement.props
      );
    }
    function isValidElement(object) {
      return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    function escape(key) {
      var escaperLookup = { "=": "=0", ":": "=2" };
      return "$" + key.replace(/[=:]/g, function(match) {
        return escaperLookup[match];
      });
    }
    var userProvidedKeyEscapeRegex = /\/+/g;
    function getElementKey(element, index) {
      return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
    }
    function noop$1() {
    }
    function resolveThenable(thenable) {
      switch (thenable.status) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw thenable.reason;
        default:
          switch ("string" === typeof thenable.status ? thenable.then(noop$1, noop$1) : (thenable.status = "pending", thenable.then(
            function(fulfilledValue) {
              "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
            },
            function(error) {
              "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
            }
          )), thenable.status) {
            case "fulfilled":
              return thenable.value;
            case "rejected":
              throw thenable.reason;
          }
      }
      throw thenable;
    }
    function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
      var type = typeof children;
      if ("undefined" === type || "boolean" === type) children = null;
      var invokeCallback = false;
      if (null === children) invokeCallback = true;
      else
        switch (type) {
          case "bigint":
          case "string":
          case "number":
            invokeCallback = true;
            break;
          case "object":
            switch (children.$$typeof) {
              case REACT_ELEMENT_TYPE:
              case REACT_PORTAL_TYPE:
                invokeCallback = true;
                break;
              case REACT_LAZY_TYPE:
                return invokeCallback = children._init, mapIntoArray(
                  invokeCallback(children._payload),
                  array,
                  escapedPrefix,
                  nameSoFar,
                  callback
                );
            }
        }
      if (invokeCallback)
        return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
          return c;
        })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(
          callback,
          escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(
            userProvidedKeyEscapeRegex,
            "$&/"
          ) + "/") + invokeCallback
        )), array.push(callback)), 1;
      invokeCallback = 0;
      var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
      if (isArrayImpl(children))
        for (var i = 0; i < children.length; i++)
          nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
            nameSoFar,
            array,
            escapedPrefix,
            type,
            callback
          );
      else if (i = getIteratorFn(children), "function" === typeof i)
        for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
          nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
            nameSoFar,
            array,
            escapedPrefix,
            type,
            callback
          );
      else if ("object" === type) {
        if ("function" === typeof children.then)
          return mapIntoArray(
            resolveThenable(children),
            array,
            escapedPrefix,
            nameSoFar,
            callback
          );
        array = String(children);
        throw Error(
          "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
        );
      }
      return invokeCallback;
    }
    function mapChildren(children, func, context) {
      if (null == children) return children;
      var result = [], count = 0;
      mapIntoArray(children, result, "", "", function(child) {
        return func.call(context, child, count++);
      });
      return result;
    }
    function lazyInitializer(payload) {
      if (-1 === payload._status) {
        var ctor = payload._result;
        ctor = ctor();
        ctor.then(
          function(moduleObject) {
            if (0 === payload._status || -1 === payload._status)
              payload._status = 1, payload._result = moduleObject;
          },
          function(error) {
            if (0 === payload._status || -1 === payload._status)
              payload._status = 2, payload._result = error;
          }
        );
        -1 === payload._status && (payload._status = 0, payload._result = ctor);
      }
      if (1 === payload._status) return payload._result.default;
      throw payload._result;
    }
    var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
      if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
        var event = new window.ErrorEvent("error", {
          bubbles: true,
          cancelable: true,
          message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
          error
        });
        if (!window.dispatchEvent(event)) return;
      } else if ("object" === typeof process && "function" === typeof process.emit) {
        process.emit("uncaughtException", error);
        return;
      }
      console.error(error);
    };
    function noop() {
    }
    exports2.Children = {
      map: mapChildren,
      forEach: function(children, forEachFunc, forEachContext) {
        mapChildren(
          children,
          function() {
            forEachFunc.apply(this, arguments);
          },
          forEachContext
        );
      },
      count: function(children) {
        var n = 0;
        mapChildren(children, function() {
          n++;
        });
        return n;
      },
      toArray: function(children) {
        return mapChildren(children, function(child) {
          return child;
        }) || [];
      },
      only: function(children) {
        if (!isValidElement(children))
          throw Error(
            "React.Children.only expected to receive a single React element child."
          );
        return children;
      }
    };
    exports2.Component = Component;
    exports2.Fragment = REACT_FRAGMENT_TYPE;
    exports2.Profiler = REACT_PROFILER_TYPE;
    exports2.PureComponent = PureComponent;
    exports2.StrictMode = REACT_STRICT_MODE_TYPE;
    exports2.Suspense = REACT_SUSPENSE_TYPE;
    exports2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
    exports2.__COMPILER_RUNTIME = {
      __proto__: null,
      c: function(size) {
        return ReactSharedInternals.H.useMemoCache(size);
      }
    };
    exports2.cache = function(fn) {
      return function() {
        return fn.apply(null, arguments);
      };
    };
    exports2.cloneElement = function(element, config, children) {
      if (null === element || void 0 === element)
        throw Error(
          "The argument must be a React element, but you passed " + element + "."
        );
      var props = assign({}, element.props), key = element.key, owner = void 0;
      if (null != config)
        for (propName in void 0 !== config.ref && (owner = void 0), void 0 !== config.key && (key = "" + config.key), config)
          !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
      var propName = arguments.length - 2;
      if (1 === propName) props.children = children;
      else if (1 < propName) {
        for (var childArray = Array(propName), i = 0; i < propName; i++)
          childArray[i] = arguments[i + 2];
        props.children = childArray;
      }
      return ReactElement(element.type, key, void 0, void 0, owner, props);
    };
    exports2.createContext = function(defaultValue) {
      defaultValue = {
        $$typeof: REACT_CONTEXT_TYPE,
        _currentValue: defaultValue,
        _currentValue2: defaultValue,
        _threadCount: 0,
        Provider: null,
        Consumer: null
      };
      defaultValue.Provider = defaultValue;
      defaultValue.Consumer = {
        $$typeof: REACT_CONSUMER_TYPE,
        _context: defaultValue
      };
      return defaultValue;
    };
    exports2.createElement = function(type, config, children) {
      var propName, props = {}, key = null;
      if (null != config)
        for (propName in void 0 !== config.key && (key = "" + config.key), config)
          hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
      var childrenLength = arguments.length - 2;
      if (1 === childrenLength) props.children = children;
      else if (1 < childrenLength) {
        for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
          childArray[i] = arguments[i + 2];
        props.children = childArray;
      }
      if (type && type.defaultProps)
        for (propName in childrenLength = type.defaultProps, childrenLength)
          void 0 === props[propName] && (props[propName] = childrenLength[propName]);
      return ReactElement(type, key, void 0, void 0, null, props);
    };
    exports2.createRef = function() {
      return { current: null };
    };
    exports2.forwardRef = function(render) {
      return { $$typeof: REACT_FORWARD_REF_TYPE, render };
    };
    exports2.isValidElement = isValidElement;
    exports2.lazy = function(ctor) {
      return {
        $$typeof: REACT_LAZY_TYPE,
        _payload: { _status: -1, _result: ctor },
        _init: lazyInitializer
      };
    };
    exports2.memo = function(type, compare) {
      return {
        $$typeof: REACT_MEMO_TYPE,
        type,
        compare: void 0 === compare ? null : compare
      };
    };
    exports2.startTransition = function(scope) {
      var prevTransition = ReactSharedInternals.T, currentTransition = {};
      ReactSharedInternals.T = currentTransition;
      try {
        var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
        null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
        "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
      } catch (error) {
        reportGlobalError(error);
      } finally {
        ReactSharedInternals.T = prevTransition;
      }
    };
    exports2.unstable_useCacheRefresh = function() {
      return ReactSharedInternals.H.useCacheRefresh();
    };
    exports2.use = function(usable) {
      return ReactSharedInternals.H.use(usable);
    };
    exports2.useActionState = function(action, initialState, permalink) {
      return ReactSharedInternals.H.useActionState(action, initialState, permalink);
    };
    exports2.useCallback = function(callback, deps) {
      return ReactSharedInternals.H.useCallback(callback, deps);
    };
    exports2.useContext = function(Context) {
      return ReactSharedInternals.H.useContext(Context);
    };
    exports2.useDebugValue = function() {
    };
    exports2.useDeferredValue = function(value, initialValue) {
      return ReactSharedInternals.H.useDeferredValue(value, initialValue);
    };
    exports2.useEffect = function(create2, createDeps, update) {
      var dispatcher = ReactSharedInternals.H;
      if ("function" === typeof update)
        throw Error(
          "useEffect CRUD overload is not enabled in this build of React."
        );
      return dispatcher.useEffect(create2, createDeps);
    };
    exports2.useId = function() {
      return ReactSharedInternals.H.useId();
    };
    exports2.useImperativeHandle = function(ref, create2, deps) {
      return ReactSharedInternals.H.useImperativeHandle(ref, create2, deps);
    };
    exports2.useInsertionEffect = function(create2, deps) {
      return ReactSharedInternals.H.useInsertionEffect(create2, deps);
    };
    exports2.useLayoutEffect = function(create2, deps) {
      return ReactSharedInternals.H.useLayoutEffect(create2, deps);
    };
    exports2.useMemo = function(create2, deps) {
      return ReactSharedInternals.H.useMemo(create2, deps);
    };
    exports2.useOptimistic = function(passthrough, reducer) {
      return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
    };
    exports2.useReducer = function(reducer, initialArg, init) {
      return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
    };
    exports2.useRef = function(initialValue) {
      return ReactSharedInternals.H.useRef(initialValue);
    };
    exports2.useState = function(initialState) {
      return ReactSharedInternals.H.useState(initialState);
    };
    exports2.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
      return ReactSharedInternals.H.useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
      );
    };
    exports2.useTransition = function() {
      return ReactSharedInternals.H.useTransition();
    };
    exports2.version = "19.1.0";
  }
});

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({
  "node_modules/react/cjs/react.development.js"(exports2, module2) {
    "use strict";
    "production" !== process.env.NODE_ENV && (function() {
      function defineDeprecationWarning(methodName, info) {
        Object.defineProperty(Component.prototype, methodName, {
          get: function() {
            console.warn(
              "%s(...) is deprecated in plain JavaScript React classes. %s",
              info[0],
              info[1]
            );
          }
        });
      }
      function getIteratorFn(maybeIterable) {
        if (null === maybeIterable || "object" !== typeof maybeIterable)
          return null;
        maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
        return "function" === typeof maybeIterable ? maybeIterable : null;
      }
      function warnNoop(publicInstance, callerName) {
        publicInstance = (publicInstance = publicInstance.constructor) && (publicInstance.displayName || publicInstance.name) || "ReactClass";
        var warningKey = publicInstance + "." + callerName;
        didWarnStateUpdateForUnmountedComponent[warningKey] || (console.error(
          "Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.",
          callerName,
          publicInstance
        ), didWarnStateUpdateForUnmountedComponent[warningKey] = true);
      }
      function Component(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function ComponentDummy() {
      }
      function PureComponent(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        try {
          testStringCoercion(value);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        if (JSCompiler_inline_result) {
          JSCompiler_inline_result = console;
          var JSCompiler_temp_const = JSCompiler_inline_result.error;
          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          JSCompiler_temp_const.call(
            JSCompiler_inline_result,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            JSCompiler_inline_result$jscomp$0
          );
          return testStringCoercion(value);
        }
      }
      function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
          case REACT_ACTIVITY_TYPE:
            return "Activity";
        }
        if ("object" === typeof type)
          switch ("number" === typeof type.tag && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), type.$$typeof) {
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_CONTEXT_TYPE:
              return (type.displayName || "Context") + ".Provider";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x) {
              }
          }
        return null;
      }
      function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
          return "<...>";
        try {
          var name = getComponentNameFromType(type);
          return name ? "<" + name + ">" : "<...>";
        } catch (x) {
          return "<...>";
        }
      }
      function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
      }
      function UnknownOwner() {
        return Error("react-stack-top-frame");
      }
      function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
          if (getter && getter.isReactWarning) return false;
        }
        return void 0 !== config.key;
      }
      function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            displayName
          ));
        }
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
      function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        ));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
      }
      function ReactElement(type, key, self, source, owner, props, debugStack, debugTask) {
        self = props.ref;
        type = {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          props,
          _owner: owner
        };
        null !== (void 0 !== self ? self : null) ? Object.defineProperty(type, "ref", {
          enumerable: false,
          get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        });
        Object.defineProperty(type, "_debugStack", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
      }
      function cloneAndReplaceKey(oldElement, newKey) {
        newKey = ReactElement(
          oldElement.type,
          newKey,
          void 0,
          void 0,
          oldElement._owner,
          oldElement.props,
          oldElement._debugStack,
          oldElement._debugTask
        );
        oldElement._store && (newKey._store.validated = oldElement._store.validated);
        return newKey;
      }
      function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      function escape(key) {
        var escaperLookup = { "=": "=0", ":": "=2" };
        return "$" + key.replace(/[=:]/g, function(match) {
          return escaperLookup[match];
        });
      }
      function getElementKey(element, index) {
        return "object" === typeof element && null !== element && null != element.key ? (checkKeyStringCoercion(element.key), escape("" + element.key)) : index.toString(36);
      }
      function noop$1() {
      }
      function resolveThenable(thenable) {
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
          default:
            switch ("string" === typeof thenable.status ? thenable.then(noop$1, noop$1) : (thenable.status = "pending", thenable.then(
              function(fulfilledValue) {
                "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
              },
              function(error) {
                "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            )), thenable.status) {
              case "fulfilled":
                return thenable.value;
              case "rejected":
                throw thenable.reason;
            }
        }
        throw thenable;
      }
      function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
        var type = typeof children;
        if ("undefined" === type || "boolean" === type) children = null;
        var invokeCallback = false;
        if (null === children) invokeCallback = true;
        else
          switch (type) {
            case "bigint":
            case "string":
            case "number":
              invokeCallback = true;
              break;
            case "object":
              switch (children.$$typeof) {
                case REACT_ELEMENT_TYPE:
                case REACT_PORTAL_TYPE:
                  invokeCallback = true;
                  break;
                case REACT_LAZY_TYPE:
                  return invokeCallback = children._init, mapIntoArray(
                    invokeCallback(children._payload),
                    array,
                    escapedPrefix,
                    nameSoFar,
                    callback
                  );
              }
          }
        if (invokeCallback) {
          invokeCallback = children;
          callback = callback(invokeCallback);
          var childKey = "" === nameSoFar ? "." + getElementKey(invokeCallback, 0) : nameSoFar;
          isArrayImpl(callback) ? (escapedPrefix = "", null != childKey && (escapedPrefix = childKey.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
            return c;
          })) : null != callback && (isValidElement(callback) && (null != callback.key && (invokeCallback && invokeCallback.key === callback.key || checkKeyStringCoercion(callback.key)), escapedPrefix = cloneAndReplaceKey(
            callback,
            escapedPrefix + (null == callback.key || invokeCallback && invokeCallback.key === callback.key ? "" : ("" + callback.key).replace(
              userProvidedKeyEscapeRegex,
              "$&/"
            ) + "/") + childKey
          ), "" !== nameSoFar && null != invokeCallback && isValidElement(invokeCallback) && null == invokeCallback.key && invokeCallback._store && !invokeCallback._store.validated && (escapedPrefix._store.validated = 2), callback = escapedPrefix), array.push(callback));
          return 1;
        }
        invokeCallback = 0;
        childKey = "" === nameSoFar ? "." : nameSoFar + ":";
        if (isArrayImpl(children))
          for (var i = 0; i < children.length; i++)
            nameSoFar = children[i], type = childKey + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if (i = getIteratorFn(children), "function" === typeof i)
          for (i === children.entries && (didWarnAboutMaps || console.warn(
            "Using Maps as children is not supported. Use an array of keyed ReactElements instead."
          ), didWarnAboutMaps = true), children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
            nameSoFar = nameSoFar.value, type = childKey + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if ("object" === type) {
          if ("function" === typeof children.then)
            return mapIntoArray(
              resolveThenable(children),
              array,
              escapedPrefix,
              nameSoFar,
              callback
            );
          array = String(children);
          throw Error(
            "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
          );
        }
        return invokeCallback;
      }
      function mapChildren(children, func, context) {
        if (null == children) return children;
        var result = [], count = 0;
        mapIntoArray(children, result, "", "", function(child) {
          return func.call(context, child, count++);
        });
        return result;
      }
      function lazyInitializer(payload) {
        if (-1 === payload._status) {
          var ctor = payload._result;
          ctor = ctor();
          ctor.then(
            function(moduleObject) {
              if (0 === payload._status || -1 === payload._status)
                payload._status = 1, payload._result = moduleObject;
            },
            function(error) {
              if (0 === payload._status || -1 === payload._status)
                payload._status = 2, payload._result = error;
            }
          );
          -1 === payload._status && (payload._status = 0, payload._result = ctor);
        }
        if (1 === payload._status)
          return ctor = payload._result, void 0 === ctor && console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?",
            ctor
          ), "default" in ctor || console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))",
            ctor
          ), ctor.default;
        throw payload._result;
      }
      function resolveDispatcher() {
        var dispatcher = ReactSharedInternals.H;
        null === dispatcher && console.error(
          "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."
        );
        return dispatcher;
      }
      function noop() {
      }
      function enqueueTask(task) {
        if (null === enqueueTaskImpl)
          try {
            var requireString = ("require" + Math.random()).slice(0, 7);
            enqueueTaskImpl = (module2 && module2[requireString]).call(
              module2,
              "timers"
            ).setImmediate;
          } catch (_err) {
            enqueueTaskImpl = function(callback) {
              false === didWarnAboutMessageChannel && (didWarnAboutMessageChannel = true, "undefined" === typeof MessageChannel && console.error(
                "This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."
              ));
              var channel = new MessageChannel();
              channel.port1.onmessage = callback;
              channel.port2.postMessage(void 0);
            };
          }
        return enqueueTaskImpl(task);
      }
      function aggregateErrors(errors) {
        return 1 < errors.length && "function" === typeof AggregateError ? new AggregateError(errors) : errors[0];
      }
      function popActScope(prevActQueue, prevActScopeDepth) {
        prevActScopeDepth !== actScopeDepth - 1 && console.error(
          "You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "
        );
        actScopeDepth = prevActScopeDepth;
      }
      function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
        var queue = ReactSharedInternals.actQueue;
        if (null !== queue)
          if (0 !== queue.length)
            try {
              flushActQueue(queue);
              enqueueTask(function() {
                return recursivelyFlushAsyncActWork(returnValue, resolve, reject);
              });
              return;
            } catch (error) {
              ReactSharedInternals.thrownErrors.push(error);
            }
          else ReactSharedInternals.actQueue = null;
        0 < ReactSharedInternals.thrownErrors.length ? (queue = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, reject(queue)) : resolve(returnValue);
      }
      function flushActQueue(queue) {
        if (!isFlushing) {
          isFlushing = true;
          var i = 0;
          try {
            for (; i < queue.length; i++) {
              var callback = queue[i];
              do {
                ReactSharedInternals.didUsePromise = false;
                var continuation = callback(false);
                if (null !== continuation) {
                  if (ReactSharedInternals.didUsePromise) {
                    queue[i] = callback;
                    queue.splice(0, i);
                    return;
                  }
                  callback = continuation;
                } else break;
              } while (1);
            }
            queue.length = 0;
          } catch (error) {
            queue.splice(0, i + 1), ReactSharedInternals.thrownErrors.push(error);
          } finally {
            isFlushing = false;
          }
        }
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler");
      /* @__PURE__ */ Symbol.for("react.provider");
      var REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = /* @__PURE__ */ Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo"), REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator, didWarnStateUpdateForUnmountedComponent = {}, ReactNoopUpdateQueue = {
        isMounted: function() {
          return false;
        },
        enqueueForceUpdate: function(publicInstance) {
          warnNoop(publicInstance, "forceUpdate");
        },
        enqueueReplaceState: function(publicInstance) {
          warnNoop(publicInstance, "replaceState");
        },
        enqueueSetState: function(publicInstance) {
          warnNoop(publicInstance, "setState");
        }
      }, assign = Object.assign, emptyObject = {};
      Object.freeze(emptyObject);
      Component.prototype.isReactComponent = {};
      Component.prototype.setState = function(partialState, callback) {
        if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
          throw Error(
            "takes an object of state variables to update or a function which returns an object of state variables."
          );
        this.updater.enqueueSetState(this, partialState, callback, "setState");
      };
      Component.prototype.forceUpdate = function(callback) {
        this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
      };
      var deprecatedAPIs = {
        isMounted: [
          "isMounted",
          "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."
        ],
        replaceState: [
          "replaceState",
          "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."
        ]
      }, fnName;
      for (fnName in deprecatedAPIs)
        deprecatedAPIs.hasOwnProperty(fnName) && defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
      ComponentDummy.prototype = Component.prototype;
      deprecatedAPIs = PureComponent.prototype = new ComponentDummy();
      deprecatedAPIs.constructor = PureComponent;
      assign(deprecatedAPIs, Component.prototype);
      deprecatedAPIs.isPureReactComponent = true;
      var isArrayImpl = Array.isArray, REACT_CLIENT_REFERENCE = /* @__PURE__ */ Symbol.for("react.client.reference"), ReactSharedInternals = {
        H: null,
        A: null,
        T: null,
        S: null,
        V: null,
        actQueue: null,
        isBatchingLegacy: false,
        didScheduleLegacyUpdate: false,
        didUsePromise: false,
        thrownErrors: [],
        getCurrentStack: null,
        recentlyCreatedOwnerStacks: 0
      }, hasOwnProperty = Object.prototype.hasOwnProperty, createTask = console.createTask ? console.createTask : function() {
        return null;
      };
      deprecatedAPIs = {
        "react-stack-bottom-frame": function(callStackForError) {
          return callStackForError();
        }
      };
      var specialPropKeyWarningShown, didWarnAboutOldJSXRuntime;
      var didWarnAboutElementRef = {};
      var unknownOwnerDebugStack = deprecatedAPIs["react-stack-bottom-frame"].bind(deprecatedAPIs, UnknownOwner)();
      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
      var didWarnAboutMaps = false, userProvidedKeyEscapeRegex = /\/+/g, reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
        if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
          var event = new window.ErrorEvent("error", {
            bubbles: true,
            cancelable: true,
            message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
            error
          });
          if (!window.dispatchEvent(event)) return;
        } else if ("object" === typeof process && "function" === typeof process.emit) {
          process.emit("uncaughtException", error);
          return;
        }
        console.error(error);
      }, didWarnAboutMessageChannel = false, enqueueTaskImpl = null, actScopeDepth = 0, didWarnNoAwaitAct = false, isFlushing = false, queueSeveralMicrotasks = "function" === typeof queueMicrotask ? function(callback) {
        queueMicrotask(function() {
          return queueMicrotask(callback);
        });
      } : enqueueTask;
      deprecatedAPIs = Object.freeze({
        __proto__: null,
        c: function(size) {
          return resolveDispatcher().useMemoCache(size);
        }
      });
      exports2.Children = {
        map: mapChildren,
        forEach: function(children, forEachFunc, forEachContext) {
          mapChildren(
            children,
            function() {
              forEachFunc.apply(this, arguments);
            },
            forEachContext
          );
        },
        count: function(children) {
          var n = 0;
          mapChildren(children, function() {
            n++;
          });
          return n;
        },
        toArray: function(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        },
        only: function(children) {
          if (!isValidElement(children))
            throw Error(
              "React.Children.only expected to receive a single React element child."
            );
          return children;
        }
      };
      exports2.Component = Component;
      exports2.Fragment = REACT_FRAGMENT_TYPE;
      exports2.Profiler = REACT_PROFILER_TYPE;
      exports2.PureComponent = PureComponent;
      exports2.StrictMode = REACT_STRICT_MODE_TYPE;
      exports2.Suspense = REACT_SUSPENSE_TYPE;
      exports2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
      exports2.__COMPILER_RUNTIME = deprecatedAPIs;
      exports2.act = function(callback) {
        var prevActQueue = ReactSharedInternals.actQueue, prevActScopeDepth = actScopeDepth;
        actScopeDepth++;
        var queue = ReactSharedInternals.actQueue = null !== prevActQueue ? prevActQueue : [], didAwaitActCall = false;
        try {
          var result = callback();
        } catch (error) {
          ReactSharedInternals.thrownErrors.push(error);
        }
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw popActScope(prevActQueue, prevActScopeDepth), callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        if (null !== result && "object" === typeof result && "function" === typeof result.then) {
          var thenable = result;
          queueSeveralMicrotasks(function() {
            didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
              "You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"
            ));
          });
          return {
            then: function(resolve, reject) {
              didAwaitActCall = true;
              thenable.then(
                function(returnValue) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  if (0 === prevActScopeDepth) {
                    try {
                      flushActQueue(queue), enqueueTask(function() {
                        return recursivelyFlushAsyncActWork(
                          returnValue,
                          resolve,
                          reject
                        );
                      });
                    } catch (error$0) {
                      ReactSharedInternals.thrownErrors.push(error$0);
                    }
                    if (0 < ReactSharedInternals.thrownErrors.length) {
                      var _thrownError = aggregateErrors(
                        ReactSharedInternals.thrownErrors
                      );
                      ReactSharedInternals.thrownErrors.length = 0;
                      reject(_thrownError);
                    }
                  } else resolve(returnValue);
                },
                function(error) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  0 < ReactSharedInternals.thrownErrors.length ? (error = aggregateErrors(
                    ReactSharedInternals.thrownErrors
                  ), ReactSharedInternals.thrownErrors.length = 0, reject(error)) : reject(error);
                }
              );
            }
          };
        }
        var returnValue$jscomp$0 = result;
        popActScope(prevActQueue, prevActScopeDepth);
        0 === prevActScopeDepth && (flushActQueue(queue), 0 !== queue.length && queueSeveralMicrotasks(function() {
          didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
            "A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"
          ));
        }), ReactSharedInternals.actQueue = null);
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        return {
          then: function(resolve, reject) {
            didAwaitActCall = true;
            0 === prevActScopeDepth ? (ReactSharedInternals.actQueue = queue, enqueueTask(function() {
              return recursivelyFlushAsyncActWork(
                returnValue$jscomp$0,
                resolve,
                reject
              );
            })) : resolve(returnValue$jscomp$0);
          }
        };
      };
      exports2.cache = function(fn) {
        return function() {
          return fn.apply(null, arguments);
        };
      };
      exports2.captureOwnerStack = function() {
        var getCurrentStack = ReactSharedInternals.getCurrentStack;
        return null === getCurrentStack ? null : getCurrentStack();
      };
      exports2.cloneElement = function(element, config, children) {
        if (null === element || void 0 === element)
          throw Error(
            "The argument must be a React element, but you passed " + element + "."
          );
        var props = assign({}, element.props), key = element.key, owner = element._owner;
        if (null != config) {
          var JSCompiler_inline_result;
          a: {
            if (hasOwnProperty.call(config, "ref") && (JSCompiler_inline_result = Object.getOwnPropertyDescriptor(
              config,
              "ref"
            ).get) && JSCompiler_inline_result.isReactWarning) {
              JSCompiler_inline_result = false;
              break a;
            }
            JSCompiler_inline_result = void 0 !== config.ref;
          }
          JSCompiler_inline_result && (owner = getOwner());
          hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key);
          for (propName in config)
            !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
        }
        var propName = arguments.length - 2;
        if (1 === propName) props.children = children;
        else if (1 < propName) {
          JSCompiler_inline_result = Array(propName);
          for (var i = 0; i < propName; i++)
            JSCompiler_inline_result[i] = arguments[i + 2];
          props.children = JSCompiler_inline_result;
        }
        props = ReactElement(
          element.type,
          key,
          void 0,
          void 0,
          owner,
          props,
          element._debugStack,
          element._debugTask
        );
        for (key = 2; key < arguments.length; key++)
          owner = arguments[key], isValidElement(owner) && owner._store && (owner._store.validated = 1);
        return props;
      };
      exports2.createContext = function(defaultValue) {
        defaultValue = {
          $$typeof: REACT_CONTEXT_TYPE,
          _currentValue: defaultValue,
          _currentValue2: defaultValue,
          _threadCount: 0,
          Provider: null,
          Consumer: null
        };
        defaultValue.Provider = defaultValue;
        defaultValue.Consumer = {
          $$typeof: REACT_CONSUMER_TYPE,
          _context: defaultValue
        };
        defaultValue._currentRenderer = null;
        defaultValue._currentRenderer2 = null;
        return defaultValue;
      };
      exports2.createElement = function(type, config, children) {
        for (var i = 2; i < arguments.length; i++) {
          var node = arguments[i];
          isValidElement(node) && node._store && (node._store.validated = 1);
        }
        i = {};
        node = null;
        if (null != config)
          for (propName in didWarnAboutOldJSXRuntime || !("__self" in config) || "key" in config || (didWarnAboutOldJSXRuntime = true, console.warn(
            "Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform"
          )), hasValidKey(config) && (checkKeyStringCoercion(config.key), node = "" + config.key), config)
            hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (i[propName] = config[propName]);
        var childrenLength = arguments.length - 2;
        if (1 === childrenLength) i.children = children;
        else if (1 < childrenLength) {
          for (var childArray = Array(childrenLength), _i = 0; _i < childrenLength; _i++)
            childArray[_i] = arguments[_i + 2];
          Object.freeze && Object.freeze(childArray);
          i.children = childArray;
        }
        if (type && type.defaultProps)
          for (propName in childrenLength = type.defaultProps, childrenLength)
            void 0 === i[propName] && (i[propName] = childrenLength[propName]);
        node && defineKeyPropWarningGetter(
          i,
          "function" === typeof type ? type.displayName || type.name || "Unknown" : type
        );
        var propName = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return ReactElement(
          type,
          node,
          void 0,
          void 0,
          getOwner(),
          i,
          propName ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          propName ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
      exports2.createRef = function() {
        var refObject = { current: null };
        Object.seal(refObject);
        return refObject;
      };
      exports2.forwardRef = function(render) {
        null != render && render.$$typeof === REACT_MEMO_TYPE ? console.error(
          "forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...))."
        ) : "function" !== typeof render ? console.error(
          "forwardRef requires a render function but was given %s.",
          null === render ? "null" : typeof render
        ) : 0 !== render.length && 2 !== render.length && console.error(
          "forwardRef render functions accept exactly two parameters: props and ref. %s",
          1 === render.length ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."
        );
        null != render && null != render.defaultProps && console.error(
          "forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?"
        );
        var elementType = { $$typeof: REACT_FORWARD_REF_TYPE, render }, ownName;
        Object.defineProperty(elementType, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            render.name || render.displayName || (Object.defineProperty(render, "name", { value: name }), render.displayName = name);
          }
        });
        return elementType;
      };
      exports2.isValidElement = isValidElement;
      exports2.lazy = function(ctor) {
        return {
          $$typeof: REACT_LAZY_TYPE,
          _payload: { _status: -1, _result: ctor },
          _init: lazyInitializer
        };
      };
      exports2.memo = function(type, compare) {
        null == type && console.error(
          "memo: The first argument must be a component. Instead received: %s",
          null === type ? "null" : typeof type
        );
        compare = {
          $$typeof: REACT_MEMO_TYPE,
          type,
          compare: void 0 === compare ? null : compare
        };
        var ownName;
        Object.defineProperty(compare, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            type.name || type.displayName || (Object.defineProperty(type, "name", { value: name }), type.displayName = name);
          }
        });
        return compare;
      };
      exports2.startTransition = function(scope) {
        var prevTransition = ReactSharedInternals.T, currentTransition = {};
        ReactSharedInternals.T = currentTransition;
        currentTransition._updatedFibers = /* @__PURE__ */ new Set();
        try {
          var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
          null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
          "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
        } catch (error) {
          reportGlobalError(error);
        } finally {
          null === prevTransition && currentTransition._updatedFibers && (scope = currentTransition._updatedFibers.size, currentTransition._updatedFibers.clear(), 10 < scope && console.warn(
            "Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."
          )), ReactSharedInternals.T = prevTransition;
        }
      };
      exports2.unstable_useCacheRefresh = function() {
        return resolveDispatcher().useCacheRefresh();
      };
      exports2.use = function(usable) {
        return resolveDispatcher().use(usable);
      };
      exports2.useActionState = function(action, initialState, permalink) {
        return resolveDispatcher().useActionState(
          action,
          initialState,
          permalink
        );
      };
      exports2.useCallback = function(callback, deps) {
        return resolveDispatcher().useCallback(callback, deps);
      };
      exports2.useContext = function(Context) {
        var dispatcher = resolveDispatcher();
        Context.$$typeof === REACT_CONSUMER_TYPE && console.error(
          "Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"
        );
        return dispatcher.useContext(Context);
      };
      exports2.useDebugValue = function(value, formatterFn) {
        return resolveDispatcher().useDebugValue(value, formatterFn);
      };
      exports2.useDeferredValue = function(value, initialValue) {
        return resolveDispatcher().useDeferredValue(value, initialValue);
      };
      exports2.useEffect = function(create2, createDeps, update) {
        null == create2 && console.warn(
          "React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        var dispatcher = resolveDispatcher();
        if ("function" === typeof update)
          throw Error(
            "useEffect CRUD overload is not enabled in this build of React."
          );
        return dispatcher.useEffect(create2, createDeps);
      };
      exports2.useId = function() {
        return resolveDispatcher().useId();
      };
      exports2.useImperativeHandle = function(ref, create2, deps) {
        return resolveDispatcher().useImperativeHandle(ref, create2, deps);
      };
      exports2.useInsertionEffect = function(create2, deps) {
        null == create2 && console.warn(
          "React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useInsertionEffect(create2, deps);
      };
      exports2.useLayoutEffect = function(create2, deps) {
        null == create2 && console.warn(
          "React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useLayoutEffect(create2, deps);
      };
      exports2.useMemo = function(create2, deps) {
        return resolveDispatcher().useMemo(create2, deps);
      };
      exports2.useOptimistic = function(passthrough, reducer) {
        return resolveDispatcher().useOptimistic(passthrough, reducer);
      };
      exports2.useReducer = function(reducer, initialArg, init) {
        return resolveDispatcher().useReducer(reducer, initialArg, init);
      };
      exports2.useRef = function(initialValue) {
        return resolveDispatcher().useRef(initialValue);
      };
      exports2.useState = function(initialState) {
        return resolveDispatcher().useState(initialState);
      };
      exports2.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
        return resolveDispatcher().useSyncExternalStore(
          subscribe,
          getSnapshot,
          getServerSnapshot
        );
      };
      exports2.useTransition = function() {
        return resolveDispatcher().useTransition();
      };
      exports2.version = "19.1.0";
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports2, module2) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module2.exports = require_react_production();
    } else {
      module2.exports = require_react_development();
    }
  }
});

// node_modules/zustand/esm/react.mjs
function useStore(api2, selector = identity) {
  const slice = import_react.default.useSyncExternalStore(
    api2.subscribe,
    import_react.default.useCallback(() => selector(api2.getState()), [api2, selector]),
    import_react.default.useCallback(() => selector(api2.getInitialState()), [api2, selector])
  );
  import_react.default.useDebugValue(slice);
  return slice;
}
var import_react, identity, createImpl, create;
var init_react = __esm({
  "node_modules/zustand/esm/react.mjs"() {
    "use strict";
    import_react = __toESM(require_react(), 1);
    init_vanilla();
    identity = (arg) => arg;
    createImpl = (createState) => {
      const api2 = createStore(createState);
      const useBoundStore = (selector) => useStore(api2, selector);
      Object.assign(useBoundStore, api2);
      return useBoundStore;
    };
    create = ((createState) => createState ? createImpl(createState) : createImpl);
  }
});

// node_modules/zustand/esm/index.mjs
var init_esm = __esm({
  "node_modules/zustand/esm/index.mjs"() {
    "use strict";
    init_vanilla();
    init_react();
  }
});

// node_modules/zustand/esm/middleware.mjs
function createJSONStorage(getStorage, options) {
  let storage;
  try {
    storage = getStorage();
  } catch (e) {
    return;
  }
  const persistStorage = {
    getItem: (name) => {
      var _a;
      const parse = (str2) => {
        if (str2 === null) {
          return null;
        }
        return JSON.parse(str2, options == null ? void 0 : options.reviver);
      };
      const str = (_a = storage.getItem(name)) != null ? _a : null;
      if (str instanceof Promise) {
        return str.then(parse);
      }
      return parse(str);
    },
    setItem: (name, newValue) => storage.setItem(name, JSON.stringify(newValue, options == null ? void 0 : options.replacer)),
    removeItem: (name) => storage.removeItem(name)
  };
  return persistStorage;
}
var toThenable, persistImpl, persist;
var init_middleware = __esm({
  "node_modules/zustand/esm/middleware.mjs"() {
    "use strict";
    toThenable = (fn) => (input) => {
      try {
        const result = fn(input);
        if (result instanceof Promise) {
          return result;
        }
        return {
          then(onFulfilled) {
            return toThenable(onFulfilled)(result);
          },
          catch(_onRejected) {
            return this;
          }
        };
      } catch (e) {
        return {
          then(_onFulfilled) {
            return this;
          },
          catch(onRejected) {
            return toThenable(onRejected)(e);
          }
        };
      }
    };
    persistImpl = (config, baseOptions) => (set, get, api2) => {
      let options = {
        storage: createJSONStorage(() => window.localStorage),
        partialize: (state) => state,
        version: 0,
        merge: (persistedState, currentState) => ({
          ...currentState,
          ...persistedState
        }),
        ...baseOptions
      };
      let hasHydrated = false;
      let hydrationVersion = 0;
      const hydrationListeners = /* @__PURE__ */ new Set();
      const finishHydrationListeners = /* @__PURE__ */ new Set();
      let storage = options.storage;
      if (!storage) {
        return config(
          (...args) => {
            console.warn(
              `[zustand persist middleware] Unable to update item '${options.name}', the given storage is currently unavailable.`
            );
            set(...args);
          },
          get,
          api2
        );
      }
      const setItem = () => {
        const state = options.partialize({ ...get() });
        return storage.setItem(options.name, {
          state,
          version: options.version
        });
      };
      const savedSetState = api2.setState;
      api2.setState = (state, replace) => {
        savedSetState(state, replace);
        return setItem();
      };
      const configResult = config(
        (...args) => {
          set(...args);
          return setItem();
        },
        get,
        api2
      );
      api2.getInitialState = () => configResult;
      let stateFromStorage;
      const hydrate = () => {
        var _a, _b;
        if (!storage) return;
        const currentVersion = ++hydrationVersion;
        hasHydrated = false;
        hydrationListeners.forEach((cb) => {
          var _a2;
          return cb((_a2 = get()) != null ? _a2 : configResult);
        });
        const postRehydrationCallback = ((_b = options.onRehydrateStorage) == null ? void 0 : _b.call(options, (_a = get()) != null ? _a : configResult)) || void 0;
        return toThenable(storage.getItem.bind(storage))(options.name).then((deserializedStorageValue) => {
          if (deserializedStorageValue) {
            if (typeof deserializedStorageValue.version === "number" && deserializedStorageValue.version !== options.version) {
              if (options.migrate) {
                const migration = options.migrate(
                  deserializedStorageValue.state,
                  deserializedStorageValue.version
                );
                if (migration instanceof Promise) {
                  return migration.then((result) => [true, result]);
                }
                return [true, migration];
              }
              console.error(
                `State loaded from storage couldn't be migrated since no migrate function was provided`
              );
            } else {
              return [false, deserializedStorageValue.state];
            }
          }
          return [false, void 0];
        }).then((migrationResult) => {
          var _a2;
          if (currentVersion !== hydrationVersion) {
            return;
          }
          const [migrated, migratedState] = migrationResult;
          stateFromStorage = options.merge(
            migratedState,
            (_a2 = get()) != null ? _a2 : configResult
          );
          set(stateFromStorage, true);
          if (migrated) {
            return setItem();
          }
        }).then(() => {
          if (currentVersion !== hydrationVersion) {
            return;
          }
          postRehydrationCallback == null ? void 0 : postRehydrationCallback(get(), void 0);
          stateFromStorage = get();
          hasHydrated = true;
          finishHydrationListeners.forEach((cb) => cb(stateFromStorage));
        }).catch((e) => {
          if (currentVersion !== hydrationVersion) {
            return;
          }
          postRehydrationCallback == null ? void 0 : postRehydrationCallback(void 0, e);
        });
      };
      api2.persist = {
        setOptions: (newOptions) => {
          options = {
            ...options,
            ...newOptions
          };
          if (newOptions.storage) {
            storage = newOptions.storage;
          }
        },
        clearStorage: () => {
          storage == null ? void 0 : storage.removeItem(options.name);
        },
        getOptions: () => options,
        rehydrate: () => hydrate(),
        hasHydrated: () => hasHydrated,
        onHydrate: (cb) => {
          hydrationListeners.add(cb);
          return () => {
            hydrationListeners.delete(cb);
          };
        },
        onFinishHydration: (cb) => {
          finishHydrationListeners.add(cb);
          return () => {
            finishHydrationListeners.delete(cb);
          };
        }
      };
      if (!options.skipHydration) {
        hydrate();
      }
      return stateFromStorage || configResult;
    };
    persist = persistImpl;
  }
});

// scripts/sim/_stubs/async-storage.ts
var store, async_storage_default;
var init_async_storage = __esm({
  "scripts/sim/_stubs/async-storage.ts"() {
    "use strict";
    store = /* @__PURE__ */ new Map();
    async_storage_default = {
      getItem: async (k) => store.has(k) ? store.get(k) : null,
      setItem: async (k, v) => {
        store.set(k, v);
      },
      removeItem: async (k) => {
        store.delete(k);
      },
      getAllKeys: async () => [...store.keys()],
      multiRemove: async (ks) => {
        ks.forEach((k) => store.delete(k));
      },
      multiGet: async (ks) => ks.map((k) => [k, store.get(k) ?? null]),
      clear: async () => {
        store.clear();
      }
    };
  }
});

// src/data/constants.ts
var GAME, PERSONALITY, SCHEMA_VERSION;
var init_constants = __esm({
  "src/data/constants.ts"() {
    "use strict";
    GAME = {
      WEEKS_PER_SEASON: 12,
      DAYS_PER_WEEK: 7,
      SEASONS_PER_YEAR: 4,
      PHASES_PER_DAY: 2,
      // docs/06: 일정은 한 달 단위. 4주 = 1달, 3달 = 1계절, 12달 = 1년.
      WEEKS_PER_MONTH: 4,
      MONTHS_PER_SEASON: 3,
      MONTHS_PER_YEAR: 12
    };
    PERSONALITY = {
      MIN: 1,
      MAX: 100,
      DEFAULT: 50
    };
    SCHEMA_VERSION = 1;
  }
});

// src/stores/gameStore.ts
var INITIAL_META, gameMetaStorage, useGameStore;
var init_gameStore = __esm({
  "src/stores/gameStore.ts"() {
    "use strict";
    init_async_storage();
    init_esm();
    init_middleware();
    init_constants();
    INITIAL_META = {
      startedAt: 0,
      totalDaysPlayed: 0,
      saveSlot: 1,
      schemaVersion: SCHEMA_VERSION
    };
    gameMetaStorage = {
      getItem: (name) => async_storage_default.getItem(`sadojeon:meta:${name}`),
      setItem: (name, value) => async_storage_default.setItem(`sadojeon:meta:${name}`, value),
      removeItem: (name) => async_storage_default.removeItem(`sadojeon:meta:${name}`)
    };
    useGameStore = create()(
      persist(
        (set, get) => ({
          meta: INITIAL_META,
          phase: "menu",
          loaded: false,
          diamonds: 60,
          // 🔧 그레이박스 시작 지급 — 업적 보상 인프라(docs/32) 도입 시 0 + 업적 수급으로 교체.
          setPhase: (phase) => set({ phase }),
          setLoaded: (loaded) => set({ loaded }),
          bumpDaysPlayed: () => set((s) => ({
            meta: { ...s.meta, totalDaysPlayed: s.meta.totalDaysPlayed + 1 }
          })),
          setSaveSlot: (slot) => set((s) => ({ meta: { ...s.meta, saveSlot: slot } })),
          addDiamonds: (n) => set((s) => ({ diamonds: Math.max(0, s.diamonds + n) })),
          spendDiamonds: (n) => {
            if (n <= 0) return true;
            if (get().diamonds < n) return false;
            set((s) => ({ diamonds: s.diamonds - n }));
            return true;
          },
          // 다이아는 계정 단위라 reset(회차·슬롯 초기화)에도 보존.
          reset: () => set({ meta: INITIAL_META, phase: "menu", loaded: false })
        }),
        {
          name: "game",
          storage: createJSONStorage(() => gameMetaStorage),
          // loaded 는 휘발 — hydration 이후 앱 흐름이 결정
          partialize: (s) => ({ meta: s.meta, phase: s.phase, diamonds: s.diamonds })
        }
      )
    );
  }
});

// src/stores/persistStorage.ts
function metaKey(name) {
  return `${APP_PREFIX}:meta:${name}`;
}
function slotKey(name) {
  const slot = useGameStore.getState().meta.saveSlot;
  return `${APP_PREFIX}:slot${slot}:${name}`;
}
var APP_PREFIX, metaStorage, slotAwareStorage;
var init_persistStorage = __esm({
  "src/stores/persistStorage.ts"() {
    "use strict";
    init_async_storage();
    init_gameStore();
    APP_PREFIX = "sadojeon";
    metaStorage = {
      getItem: (name) => async_storage_default.getItem(metaKey(name)),
      setItem: (name, value) => async_storage_default.setItem(metaKey(name), value),
      removeItem: (name) => async_storage_default.removeItem(metaKey(name))
    };
    slotAwareStorage = {
      getItem: (name) => async_storage_default.getItem(slotKey(name)),
      setItem: (name, value) => async_storage_default.setItem(slotKey(name), value),
      removeItem: (name) => async_storage_default.removeItem(slotKey(name))
    };
  }
});

// src/types/realm.ts
var REALM_ORDER, REALM_LABEL;
var init_realm = __esm({
  "src/types/realm.ts"() {
    "use strict";
    REALM_ORDER = [
      "none",
      "samryu",
      "iryu",
      "ilryu",
      "jeoljeong",
      "chojeoljeong",
      "hwagyeong"
    ];
    REALM_LABEL = {
      none: "\uBBF8\uC785\uBB38",
      samryu: "\uC0BC\uB958",
      iryu: "\uC774\uB958",
      ilryu: "\uC77C\uB958",
      jeoljeong: "\uC808\uC815",
      chojeoljeong: "\uCD08\uC808\uC815",
      hwagyeong: "\uD654\uACBD"
    };
  }
});

// src/data/realm.ts
function realmCeiling() {
  return "ilryu";
}
function artGradeRealmCeiling(grade) {
  switch (grade) {
    case "novice":
      return "ilryu";
    //        하품 ~일류
    case "apprentice":
      return "jeoljeong";
    //    중품 ~절정
    case "master":
      return "chojeoljeong";
    // 상품 ~초절정
    case "grandmaster":
    case "legendary":
      return "hwagyeong";
  }
}
function effectiveRealmCeiling(grade) {
  return artGradeRealmCeiling(grade);
}
function nextRealm(r) {
  const i = REALM_ORDER.indexOf(r);
  if (i < 0 || i >= REALM_ORDER.length - 1) return null;
  return REALM_ORDER[i + 1];
}
function realmIndex(r) {
  return REALM_ORDER.indexOf(r);
}
function wallInternalReq(target) {
  return target === "hwagyeong" ? REALM_INTERNAL_REQ.chojeoljeong : REALM_INTERNAL_REQ[target];
}
function externalSupportReq(target) {
  const req = REALM_EXTERNAL_REQ[target];
  return target === "hwagyeong" ? req - BONE_REBIRTH_STRENGTH_BONUS : req;
}
function isWallTransition(target) {
  return WALL_TARGETS.includes(target);
}
function enlightenmentChance(insight, target) {
  const c = ENLIGHTENMENT_BASE[target] ?? { base: 0.15, perInsight: 0.06 };
  const raw = c.base + Math.max(0, insight) * c.perInsight;
  return Math.max(0.02, Math.min(0.95, raw));
}
function greatEnlightenmentChance(insight, mode) {
  const i = Math.max(0, insight);
  const raw = mode === "seclude" ? GREAT_ENLIGHTENMENT.secludePerDayBase + i * GREAT_ENLIGHTENMENT.secludePerDayPerInsight : GREAT_ENLIGHTENMENT.questBase + i * GREAT_ENLIGHTENMENT.questPerInsight;
  return Math.max(0, Math.min(0.5, raw));
}
var REALM_INTERNAL_REQ, REALM_EXTERNAL_REQ, BONE_REBIRTH_STRENGTH_BONUS, REALM_SEONG_GATE, WALL_TARGETS, REALM_SEONG_CAP, REALM_LEARN_FLOOR, ENLIGHTENMENT_BASE, ENLIGHTENMENT_PITY_STEP, ENLIGHTENMENT_PITY_GUARANTEE, GREAT_ENLIGHTENMENT;
var init_realm2 = __esm({
  "src/data/realm.ts"() {
    "use strict";
    init_realm();
    REALM_INTERNAL_REQ = {
      none: 0,
      samryu: 0,
      iryu: 260,
      ilryu: 520,
      jeoljeong: 870,
      chojeoljeong: 1050,
      hwagyeong: 1300
    };
    REALM_EXTERNAL_REQ = {
      none: 0,
      samryu: 10,
      iryu: 20,
      ilryu: 35,
      jeoljeong: 48,
      chojeoljeong: 56,
      hwagyeong: 70
    };
    BONE_REBIRTH_STRENGTH_BONUS = 8;
    REALM_SEONG_GATE = {
      none: 0,
      samryu: 0,
      iryu: 0,
      ilryu: 0,
      jeoljeong: 0,
      chojeoljeong: 5,
      hwagyeong: 7
    };
    WALL_TARGETS = ["jeoljeong", "chojeoljeong", "hwagyeong"];
    REALM_SEONG_CAP = {
      none: 0,
      samryu: 3,
      //   입문 밴드 끝
      iryu: 4,
      ilryu: 6,
      //    소성 밴드 끝
      jeoljeong: 7,
      // 대성 입
      chojeoljeong: 8,
      hwagyeong: 10
      // 극성
    };
    REALM_LEARN_FLOOR = {
      none: 1,
      samryu: 1,
      iryu: 2,
      ilryu: 3,
      jeoljeong: 4,
      chojeoljeong: 5,
      hwagyeong: 6
    };
    ENLIGHTENMENT_BASE = {
      iryu: { base: 0.3, perInsight: 0.06 },
      ilryu: { base: 0.22, perInsight: 0.06 },
      jeoljeong: { base: 0.15, perInsight: 0.07 },
      chojeoljeong: { base: 0.1, perInsight: 0.05 },
      hwagyeong: { base: 0.05, perInsight: 0.05 }
    };
    ENLIGHTENMENT_PITY_STEP = 0.05;
    ENLIGHTENMENT_PITY_GUARANTEE = 12;
    GREAT_ENLIGHTENMENT = {
      secludePerDayBase: 1e-4,
      // 폐관 1일당 기본 0.01% — 폐관만 수년 돌려도 ~10%대(소극 플레이의 천장)
      secludePerDayPerInsight: 4e-5,
      // + 오성×0.004%p (오성4 ≈ 0.026%/일)
      questBase: 7e-3,
      // 결투·큰의뢰 생환 1회당 기본 0.7% — 실전이 대오의 주 무대
      questPerInsight: 35e-4
      // + 오성×0.35%p (오성3 ≈ 1.75% · 오성4 ≈ 2.1% · 오성5 ≈ 2.45%/회)
    };
  }
});

// src/data/martialArts/catalog/common.ts
var COMMON_ARTS;
var init_common = __esm({
  "src/data/martialArts/catalog/common.ts"() {
    "use strict";
    COMMON_ARTS = [
      // ─── 검(sword) 4 — 삼재검법 → 낭인검법/유수검법 ⇒ 유성검법(합류) ───
      {
        id: "samjae-sword",
        name: "\uC0BC\uC7AC\uAC80\uBC95",
        hanjaName: "\u4E09\u624D\u528D\u6CD5",
        description: "\uCC9C(\u5929)\xB7\uC9C0(\u5730)\xB7\uC778(\u4EBA) \uC138 \uACB0\uB85C \uC774\uB8E8\uC5B4\uC9C4 \uCC9C\uD558 \uACF5\uC6A9\uC758 \uC785\uBB38 \uAC80\uBC95. \uBB34\uAD00\uB9C8\uB2E4 \uAC00\uB974\uCE5C\uB2E4.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: true,
        lineage: "common",
        acquisition: "start"
      },
      {
        id: "common-nangin-geombeop",
        name: "\uB0AD\uC778\uAC80\uBC95",
        hanjaName: "\u6D6A\u4EBA\u528D\u6CD5",
        description: "\uC8FC\uC778 \uC5C6\uC774 \uAC15\uD638\uB97C \uB5A0\uB3C4\uB294 \uB0AD\uC778\uB4E4\uC758 \uC2E4\uC804 \uAC80. \uAD70\uB354\uB354\uAE30\uAC00 \uC5C6\uB2E4.",
        school: "sword",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "samjae-sword", minSeong: 3 }]
      },
      {
        id: "common-yusu-geombeop",
        name: "\uC720\uC218\uAC80\uBC95",
        hanjaName: "\u6D41\u6C34\u528D\u6CD5",
        description: "\uD750\uB974\uB294 \uBB3C\uCC98\uB7FC \uB04A\uAE30\uC9C0 \uC54A\uACE0 \uC774\uC5B4\uC9C0\uB294 \uCC9C\uD558 \uACF5\uC6A9\uC758 \uAC80\uB9AC.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "samjae-sword", minSeong: 3 }]
      },
      {
        id: "common-yuseong-geombeop",
        name: "\uC720\uC131\uAC80\uBC95",
        hanjaName: "\u6D41\u661F\u528D\u6CD5",
        description: "\uBCC4\uB625\uBCC4\uC774 \uB5A8\uC5B4\uC9C0\uB4EF \uD55C \uC810\uC73C\uB85C \uB0B4\uB9AC\uAF42\uD788\uB294 \uAC80. \uB5A0\uB3C4\uB294 \uBE44\uAE09 \uAC00\uC6B4\uB370 \uB4DC\uBB38 \uC0C1\uC2B9\uC758 \uAC83.",
        school: "sword",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [
          { artId: "common-nangin-geombeop", minSeong: 5 },
          { artId: "common-yusu-geombeop", minSeong: 4 }
        ]
      },
      // ─── 도(saber) 3 — 박도술 → 연환도법 → 풍뢰도법 ───
      {
        id: "common-bakdo-sul",
        name: "\uBC15\uB3C4\uC220",
        hanjaName: "\u6734\u5200\u8853",
        description: "\uBCD1\uC878\uACFC \uD45C\uC0AC, \uC0AC\uB0E5\uAFBC\uAE4C\uC9C0 \uB450\uB8E8 \uC4F0\uB294 \uBC15\uB3C4\uC758 \uAE30\uBCF8\uAE30.",
        school: "saber",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest"
      },
      {
        id: "common-yeonhwan-dobeop",
        name: "\uC5F0\uD658\uB3C4\uBC95",
        hanjaName: "\u9023\u74B0\u5200\u6CD5",
        description: "\uD55C \uBC88 \uC2DC\uC791\uD558\uBA74 \uB04A\uC774\uC9C0 \uC54A\uB294 \uC5F0\uD658\uC758 \uBCA0\uAE30. \uBB34\uAD00\uB9C8\uB2E4 \uD55C \uBC8C\uC529 \uB3C4\uB294 \uB3C4\uBC95.",
        school: "saber",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "common-bakdo-sul", minSeong: 3 }]
      },
      {
        id: "common-pungroe-dobeop",
        name: "\uD48D\uB8B0\uB3C4\uBC95",
        hanjaName: "\u98A8\u96F7\u5200\u6CD5",
        description: "\uBC14\uB78C\uCC98\uB7FC \uB4E4\uACE0 \uC6B0\uB808\uCC98\uB7FC \uB5A8\uC5B4\uC9C4\uB2E4\uB294, \uAC15\uD638\uC5D0 \uB5A0\uB3C4\uB294 \uC0C1\uC2B9 \uB3C4\uBC95.",
        school: "saber",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "common-yeonhwan-dobeop", minSeong: 5 }]
      },
      // ─── 권(fist) 5 — 태조장권 → 소홍권/맹호권, 소홍권 → 선풍퇴, 맹호권 → 거령권 ───
      {
        id: "taejo-janggwon",
        name: "\uD0DC\uC870\uC7A5\uAD8C",
        hanjaName: "\u592A\u7956\u9577\u62F3",
        description: "\uC1A1 \uD0DC\uC870\uAC00 \uB0A8\uACBC\uB2E4 \uC804\uD558\uB294 \uCC9C\uD558 \uACF5\uC6A9\uC758 \uC7A5\uAD8C. \uD654\uB824\uD558\uC9C0 \uC54A\uC73C\uB098 \uBE48\uD2C8\uC774 \uC5C6\uB2E4.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: true,
        lineage: "common",
        acquisition: "start"
      },
      {
        id: "common-sohong-gwon",
        name: "\uC18C\uD64D\uAD8C",
        hanjaName: "\u5C0F\u6D2A\u62F3",
        description: "\uD0DC\uC870\uC7A5\uAD8C\uC758 \uACE8\uC790\uB97C \uCD94\uB824 \uD480\uC5B4\uC4F4 \uC785\uBB38 \uAD8C\uBCF4. \uC2DC\uACE8 \uBB34\uAD00\uB9C8\uB2E4 \uD55C \uBC8C\uC529 \uB3C8\uB2E4.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "taejo-janggwon", minSeong: 2 }]
      },
      {
        id: "common-maengho-gwon",
        name: "\uB9F9\uD638\uAD8C",
        hanjaName: "\u731B\u864E\u62F3",
        description: "\uD638\uB791\uC774\uC758 \uC0AC\uB098\uC6C0\uC744 \uBCF8\uB72C \uCC9C\uD558 \uACF5\uC6A9\uC758 \uAD8C\uBC95. \uC0B0\uC57C\uC758 \uBB34\uAD00\uB9C8\uB2E4 \uAC00\uB974\uCE5C\uB2E4.",
        school: "fist",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "taejo-janggwon", minSeong: 2 }]
      },
      {
        id: "common-seonpung-toe",
        name: "\uC120\uD48D\uD1F4",
        hanjaName: "\u65CB\u98A8\u817F",
        description: "\uD68C\uC624\uB9AC\uBC14\uB78C\uCC98\uB7FC \uB3CC\uBA70 \uCC28\uB294 \uBC1C\uAE38\uC9C8\uC758 \uAD50\uBCF8. \uBD81\uBC29 \uBB34\uAD00\uC5D0\uC11C \uCC9C\uD558\uB85C \uD37C\uC84C\uB2E4.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "common-sohong-gwon", minSeong: 3 }]
      },
      {
        id: "common-georyeong-gwon",
        name: "\uAC70\uB839\uAD8C",
        hanjaName: "\u5DE8\u9748\u62F3",
        description: "\uAC70\uB839\uC2E0\uC774 \uC0B0\uC744 \uCABC\uAC1C\uB4EF \uBB35\uC9C1\uD55C \uD55C \uC218\uC5D0 \uBAA8\uB4E0 \uAC83\uC744 \uC2E3\uB294 \uAD8C\uBC95.",
        school: "fist",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "common-maengho-gwon", minSeong: 5 }]
      },
      // ─── 보법(lightness) 5 — 초상비 → 답설무흔 → 등평도수, 초상비 → 비연보/팔보간섬 ───
      {
        id: "chosangbi",
        name: "\uCD08\uC0C1\uBE44",
        hanjaName: "\u8349\u4E0A\u98DB",
        description: "\uD480\uC78E \uC704\uB97C \uB2EC\uB9AC\uB4EF \uAC00\uBCCD\uAC8C \uB51B\uB294 \uACBD\uACF5\uC758 \uC785\uBB38. \uBAA8\uB4E0 \uBCF4\uBC95\xB7\uC2E0\uBC95\uC758 \uBC1B\uCE68.",
        school: "lightness",
        grade: "novice",
        path: "jung",
        isSectArt: true,
        lineage: "common",
        acquisition: "start"
      },
      {
        id: "dapseol-muheun",
        name: "\uB2F5\uC124\uBB34\uD754",
        hanjaName: "\u8E0F\u96EA\u7121\u75D5",
        description: "\uB208 \uC704\uB97C \uB2EC\uB824\uB3C4 \uC790\uAD6D \uD558\uB098 \uB0A8\uC9C0 \uC54A\uB294\uB2E4. \uCC9C\uD558\uC5D0 \uB3C4\uB294 \uACBD\uACF5\uC758 \uB458\uC9F8 \uAC78\uC74C.",
        school: "lightness",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "deungpyeong-dosu",
        name: "\uB4F1\uD3C9\uB3C4\uC218",
        hanjaName: "\u767B\u840D\u6E21\u6C34",
        description: "\uBD80\uD3C9\uCD08\uB97C \uBC1F\uACE0 \uBB3C\uC744 \uAC74\uB10C\uB2E4. \uB3C4\uAC00\uC5D0\uC11C \uB098\uC654\uB2E4 \uC804\uD558\uB098 \uC774\uC81C\uB294 \uCC9C\uD558 \uACBD\uACF5\uC758 \uB192\uC740 \uACBD\uC9C0\uB97C \uC774\uB974\uB294 \uC774\uB984.",
        school: "lightness",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "dapseol-muheun", minSeong: 5 }]
      },
      {
        id: "common-biyeon-bo",
        name: "\uBE44\uC5F0\uBCF4",
        hanjaName: "\u98DB\u71D5\u6B65",
        description: "\uC81C\uBE44\uAC00 \uCC98\uB9C8\uB97C \uC2A4\uCE58\uB4EF \uAC00\uBCCD\uAC8C \uBC29\uD5A5\uC744 \uAEBE\uB294 \uBCF4\uBC95.",
        school: "lightness",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "common-palbo-ganseom",
        name: "\uD314\uBCF4\uAC04\uC12C",
        hanjaName: "\u516B\u6B65\u8D95\u87EC",
        description: "\uC5EC\uB35F \uAC78\uC74C\uC5D0 \uB9E4\uBBF8\uB97C \uB530\uB77C\uC7A1\uB294\uB2E4\uB294 \uAC15\uD638\uC758 \uACBD\uC2E0\uC220.",
        school: "lightness",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      // ─── 외공(external) 5 — 금종조 → 철두공/석갑공, 철두공 → 철골공 ⇒ 철탑공(합류) ───
      {
        id: "geumjong-jo",
        name: "\uAE08\uC885\uC870",
        hanjaName: "\u91D1\u9418\u7F69",
        description: "\uBAB8\uC5D0 \uAE08\uBE5B \uC885\uC744 \uB450\uB978 \uB4EF \uB2E8\uB2E8\uD574\uC9C0\uB294 \uC815\uD1B5 \uAE30\uCD08 \uC678\uACF5. \uB9DE\uACE0 \uBC84\uD2F0\uB294 \uBC95\uBD80\uD130 \uAC00\uB974\uCE5C\uB2E4.",
        school: "external",
        grade: "novice",
        path: "jung",
        isSectArt: true,
        lineage: "common",
        acquisition: "start"
      },
      {
        id: "common-cheoldu-gong",
        name: "\uB3D9\uB450\uACF5",
        hanjaName: "\u9285\u982D\u529F",
        description: "\uC774\uB9C8\uB85C \uBE44\uC11D\uC744 \uAE6C\uB2E4\uB294 \uD754\uD558\uACE0\uB3C4 \uC6B0\uC9C1\uD55C \uC678\uACF5.",
        school: "external",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "geumjong-jo", minSeong: 3 }]
      },
      {
        id: "common-seokgap-gong",
        name: "\uC11D\uAC11\uACF5",
        hanjaName: "\u77F3\u7532\u529F",
        description: "\uB3CC \uAC11\uC637\uC744 \uB450\uB978 \uB4EF \uC0B4\uAC17\uC744 \uB2E4\uC9C0\uB294 \uC0B0\uC57C\uC758 \uC678\uACF5.",
        school: "external",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "geumjong-jo", minSeong: 3 }]
      },
      {
        id: "common-cheolgol-gong",
        name: "\uCCA0\uACE8\uACF5",
        hanjaName: "\u9435\u9AA8\u529F",
        description: "\uBF08\uB300\uB97C \uBB34\uC1E0\uCC98\uB7FC \uBCBC\uB9AC\uB294 \uC678\uACF5. \uB9DE\uC744\uC218\uB85D \uB2E8\uB2E8\uD574\uC9C4\uB2E4.",
        school: "external",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "common-cheoldu-gong", minSeong: 3 }]
      },
      {
        id: "common-cheoltap-gong",
        name: "\uCCA0\uD0D1\uACF5",
        hanjaName: "\u9435\u5854\u529F",
        description: "\uCCA0\uD0D1\uCC98\uB7FC \uD754\uB4E4\uB9AC\uC9C0 \uC54A\uB294 \uBAB8\uC744 \uB9CC\uB4DC\uB294 \uC678\uACF5\uC758 \uB192\uC740 \uACBD\uC9C0.",
        school: "external",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [
          { artId: "common-cheolgol-gong", minSeong: 5 },
          { artId: "common-seokgap-gong", minSeong: 5 }
        ]
      },
      // ─── 심법(qigong) 5 — 토납법 → 팔단금 → 소주천공 → 대주천공 → 무명심법(절품) ───
      {
        id: "tonap-beop",
        name: "\uD1A0\uB0A9\uBC95",
        hanjaName: "\u5410\u7D0D\u6CD5",
        description: "\uBB35\uC740 \uC228\uC744 \uBC49\uACE0 \uC0C8 \uAE30\uC6B4\uC744 \uC0BC\uD0A4\uB294 \uAC00\uC7A5 \uC624\uB798\uB41C \uD638\uD761\uBC95. \uBAA8\uB4E0 \uB0B4\uACF5\uC758 \uCCAB\uAC78\uC74C.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: true,
        lineage: "common",
        acquisition: "start"
      },
      {
        id: "common-paldan-geum",
        name: "\uD314\uB2E8\uAE08",
        hanjaName: "\u516B\u6BB5\u9326",
        description: "\uC5EC\uB35F \uB9C8\uB514 \uBE44\uB2E8\uACB0\uCC98\uB7FC \uAE30\uD608\uC744 \uACE0\uB974\uB294 \uC624\uB798\uB41C \uB3C4\uC778\uC220. \uC758\uC6D0\uACFC \uBB34\uC778\uC774 \uB450\uB8E8 \uB2E6\uB294\uB2E4.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "tonap-beop", minSeong: 3 }]
      },
      {
        id: "common-sojucheon-gong",
        name: "\uC18C\uC8FC\uCC9C\uACF5",
        hanjaName: "\u5C0F\u5468\u5929\u529F",
        description: "\uAE30\uB97C \uC784\uB3C5 \uB450 \uB9E5\uC73C\uB85C \uD55C \uBC14\uD034 \uB3CC\uB9AC\uB294 \uCC9C\uD558 \uACF5\uC6A9\uC758 \uD1A0\uB300 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "common-paldan-geum", minSeong: 3 }]
      },
      {
        id: "common-daejucheon-gong",
        name: "\uB300\uC8FC\uCC9C\uACF5",
        hanjaName: "\u5927\u5468\u5929\u529F",
        description: "\uC628\uBAB8\uC758 \uACBD\uB9E5\uC73C\uB85C \uAE30\uB97C \uD06C\uAC8C \uB3CC\uB9AC\uB294 \uC0C1\uC2B9 \uC2EC\uBC95.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "common-sojucheon-gong", minSeong: 5 }]
      },
      {
        id: "common-mumyeong-simbeop",
        name: "\uBB34\uBA85\uC2EC\uBC95",
        hanjaName: "\u7121\u540D\u5FC3\u6CD5",
        description: "\uC9C0\uC740\uC774\uB3C4 \uC774\uB984\uB3C4 \uC783\uC740 \uCC44 \uAC15\uD638\uB97C \uB5A0\uB3C4\uB294 \uC808\uD559. \uB05D\uAE4C\uC9C0 \uC77D\uC5B4\uB0B8 \uC790\uAC00 \uB4DC\uBB3C\uB2E4.",
        school: "qigong",
        grade: "grandmaster",
        path: "jung",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "common-daejucheon-gong", minSeong: 6 }]
      },
      // ─── 암기(hidden) 3 — 박도술 → 비도술 → 유엽표 → 연주표 ───
      {
        id: "common-bido-sul",
        name: "\uBE44\uB3C4\uC220",
        hanjaName: "\u98DB\u5200\u8853",
        description: "\uD488\uC5D0 \uC228\uAE34 \uB2E8\uB3C4\uB97C \uB358\uC9C0\uB294 \uAC15\uD638 \uB0AD\uC778\uB4E4\uC758 \uD638\uC2E0 \uAE30\uC608.",
        school: "hidden",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "common-bakdo-sul", minSeong: 3 }]
      },
      {
        id: "common-yuyeop-pyo",
        name: "\uC720\uC5FD\uD45C",
        hanjaName: "\u67F3\u8449\u93E2",
        description: "\uBC84\uB4E4\uC78E \uBAA8\uC591 \uD45C\uCC3D\uC744 \uD769\uB0A0\uB9AC\uB294 \uC554\uAE30\uC220.",
        school: "hidden",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "common-bido-sul", minSeong: 3 }]
      },
      {
        id: "common-yeonju-pyo",
        name: "\uC5F0\uC8FC\uD45C",
        hanjaName: "\u9023\u73E0\u93E2",
        description: "\uAD6C\uC2AC\uC744 \uAFF0\uB4EF \uB04A\uC774\uC9C0 \uC54A\uACE0 \uC774\uC5B4 \uB358\uC9C0\uB294 \uC554\uAE30\uC220\uC758 \uC0C1\uC2B9 \uACBD\uC9C0.",
        school: "hidden",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "common",
        acquisition: "quest",
        prerequisites: [{ artId: "common-yuyeop-pyo", minSeong: 5 }]
      }
    ];
  }
});

// src/data/martialArts/catalog/hwasan.ts
var HWASAN_ARTS;
var init_hwasan = __esm({
  "src/data/martialArts/catalog/hwasan.ts"() {
    "use strict";
    HWASAN_ARTS = [
      // ─── 검(sword) 14 — 기초 → 육합/운대 분기 → 매화·자하 → 이십사수·서악일검 ───
      {
        id: "hwasan-gicho-sword",
        name: "\uD654\uC0B0\uAE30\uCD08\uAC80",
        hanjaName: "\u83EF\u5C71\u57FA\u790E\u528D",
        description: "\uD654\uC0B0 \uC785\uBB38\uC81C\uC790\uAC00 \uCC98\uC74C \uC7A1\uB294 \uAC80. \uBAA8\uB4E0 \uD654\uC0B0 \uAC80\uC758 \uBFCC\uB9AC.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest"
      },
      {
        id: "hwasan-nakhwa-sword",
        name: "\uB099\uD654\uAC80",
        hanjaName: "\u843D\u82B1\u528D",
        description: "\uC9C0\uB294 \uAF43\uC78E\uC758 \uACB0\uC744 \uB530\uB77C \uBD80\uB4DC\uB7FD\uAC8C \uBCA0\uB294 \uD654\uC0B0\uC758 \uAE30\uCD08 \uAC80.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "hwasan-gicho-sword", minSeong: 2 }]
      },
      {
        id: "yukhap-sword",
        name: "\uC721\uD569\uAC80",
        hanjaName: "\u516D\u5408\u528D",
        description: "\uCC9C\uC9C0\uC0AC\uBC29\uC744 \uD558\uB098\uB85C \uBCA0\uB294 \uD654\uC0B0 \uC911\uAE09 \uAC80. \uC5EC\uB7EC \uC808\uAE30\uC758 \uAC08\uB9BC\uBAA9.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "hwasan-gicho-sword", minSeong: 3 }]
      },
      {
        id: "hwasan-undae-sword",
        name: "\uC6B4\uB300\uAC80\uBC95",
        hanjaName: "\u96F2\u81FA\u528D\u6CD5",
        description: "\uD654\uC0B0 \uC6B4\uB300\uBD09\uC758 \uAD6C\uB984\uC744 \uBCF8\uB72C \uC911\uAE09 \uAC80. \uB113\uAC8C \uD3BC\uCE58\uACE0 \uB192\uAC8C \uB9FA\uB294\uB2E4.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "hwasan-gicho-sword", minSeong: 3 }]
      },
      {
        id: "hwasan-maehwa-samrong-sword",
        name: "\uB9E4\uD654\uC0BC\uB871\uAC80",
        hanjaName: "\u6885\u82B1\u4E09\u5F04\u528D",
        description: "\uB9E4\uD654 \uAC00\uB77D \uC138 \uB9C8\uB514\uB97C \uAC80\uC5D0 \uC62E\uACBC\uB2E4. \uAC19\uC740 \uCD08\uC2DD\uC774 \uC138 \uBC88 \uB2E4\uB974\uAC8C \uD540\uB2E4.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "hwasan-nakhwa-sword", minSeong: 3 }]
      },
      {
        id: "hwasan-kwae-sword",
        name: "\uD654\uC0B0\uCF8C\uAC80",
        hanjaName: "\u83EF\u5C71\u5FEB\u528D",
        description: "\uBE60\uB974\uAE30\uB85C \uC2B9\uBD80\uD558\uB294 \uD654\uC0B0\uC758 \uCF8C\uAC80. \uD55C \uD638\uD761\uC5D0 \uC138 \uAC80\uC774 \uB098\uAC04\uB2E4.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "yukhap-sword", minSeong: 3 }],
        traits: ["swift"]
        // 쾌검 — 한 호흡에 세 검. 선공·연격(신법↑), 단일.
      },
      {
        id: "hwasan-yeonhwan-sword",
        name: "\uD654\uC0B0\uC5F0\uD658\uAC80",
        hanjaName: "\u83EF\u5C71\u9023\u74B0\u528D",
        description: "\uACE0\uB9AC\uCC98\uB7FC \uB04A\uAE40 \uC5C6\uC774 \uC774\uC5B4\uC9C0\uB294 \uAC80. \uD55C \uBC88 \uBB3C\uB9AC\uBA74 \uBE60\uC838\uB098\uAC00\uAE30 \uC5B4\uB835\uB2E4.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "hwasan-undae-sword", minSeong: 4 }]
      },
      {
        id: "maehwa-sword",
        name: "\uB9E4\uD654\uAC80\uBC95",
        hanjaName: "\u6885\u82B1\u528D\u6CD5",
        description: "\uB9E4\uD654\uAC00 \uD769\uB0A0\uB9AC\uB4EF \uD604\uB780\uD55C \uD654\uC0B0 \uAC80. \uC721\uD569\uAC80\uC5D0\uC11C \uAC08\uB77C\uC9C4 \uD55C \uAE38.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "yukhap-sword", minSeong: 5 }]
      },
      {
        id: "jaha-sword",
        name: "\uC790\uD558\uAC80\uBC95",
        hanjaName: "\u7D2B\u971E\u528D\u6CD5",
        description: "\uBCF4\uB78F\uBE5B \uB178\uC744\uC758 \uAE30\uC6B4\uC744 \uB450\uB978 \uD654\uC0B0 \uAC80. \uC721\uD569\uAC80\uC5D0\uC11C \uAC08\uB77C\uC9C4 \uB610 \uD55C \uAE38.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "yukhap-sword", minSeong: 5 }]
      },
      {
        id: "hwasan-nakhwa-yusu-sword",
        name: "\uB099\uD654\uC720\uC218\uAC80",
        hanjaName: "\u843D\u82B1\u6D41\u6C34\u528D",
        description: "\uC9C0\uB294 \uAF43\uACFC \uD750\uB974\uB294 \uBB3C\uCC98\uB7FC \uB9C9\uD798\uC5C6\uC774 \uC774\uC5B4\uC9C0\uB294 \uD654\uC0B0 \uC0C1\uC2B9 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [
          { artId: "hwasan-maehwa-samrong-sword", minSeong: 5 },
          { artId: "hwasan-kwae-sword", minSeong: 4 }
        ]
      },
      {
        id: "hwasan-undae-singeom",
        name: "\uC6B4\uB300\uC2E0\uAC80",
        hanjaName: "\u96F2\u81FA\u795E\u528D",
        description: "\uC6B4\uB300\uBD09 \uAF2D\uB300\uAE30\uC758 \uAD6C\uB984\uC744 \uAC00\uB978\uB2E4. \uB192\uC740 \uB370\uC11C \uB0B4\uB824 \uBCA0\uB294 \uAE30\uC138\uAC00 \uC0B0\uACFC \uAC19\uB2E4.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "hwasan-yeonhwan-sword", minSeong: 5 }]
      },
      {
        id: "hwasan-maehwa-mangae-sword",
        name: "\uB9E4\uD654\uB9CC\uAC1C\uAC80",
        hanjaName: "\u6885\u82B1\u6EFF\u958B\u528D",
        description: "\uD55C \uAC80\uC5D0 \uB9E4\uD654 \uBC31 \uC1A1\uC774\uAC00 \uC77C\uC2DC\uC5D0 \uD540\uB2E4 \u2014 \uB9E4\uD654\uAC80\uBC95\uC774 \uBB34\uB974\uC775\uC740 \uACBD\uC9C0.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "maehwa-sword", minSeong: 5 }]
      },
      {
        id: "isipsa-maehwa-sword",
        name: "\uC774\uC2ED\uC0AC\uC218\uB9E4\uD654\uAC80",
        hanjaName: "\u4E8C\u5341\u56DB\u624B\u6885\u82B1\u528D",
        description: "\uB9E4\uD654\uC640 \uC790\uD558\uC758 \uBB18\uB9AC\uB97C \uD55C\uB370 \uBAA8\uC740 \uD654\uC0B0 \uBE44\uC804. \uB450 \uAE38\uC774 \uB2E4\uC2DC \uB9CC\uB098\uB294 \uC815\uC810.",
        school: "sword",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [
          { artId: "maehwa-sword", minSeong: 6 },
          { artId: "jaha-sword", minSeong: 4 }
        ]
      },
      {
        id: "hwasan-seoak-ilgeom",
        name: "\uC11C\uC545\uC77C\uAC80",
        hanjaName: "\u897F\u5DBD\u4E00\u528D",
        description: "\uC11C\uC545 \uD654\uC0B0\uC758 \uC774\uB984\uC744 \uAC74 \uB2E8 \uD55C \uBC88\uC758 \uAC80. \uCC9C \uCD08\uC2DD\uC774 \uD55C \uD68D\uC73C\uB85C \uB3CC\uC544\uC628\uB2E4.",
        school: "sword",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [
          { artId: "hwasan-maehwa-mangae-sword", minSeong: 6 },
          { artId: "hwasan-undae-singeom", minSeong: 5 }
        ]
      },
      // ─── 심법(qigong) 6 — 매화기공 → 자하심결/운대심법 → 조원공 → 자하신공 ───
      {
        id: "maehwa-gigong",
        name: "\uB9E4\uD654\uAE30\uACF5",
        hanjaName: "\u6885\u82B1\u6C23\u529F",
        description: "\uD654\uC0B0 \uC785\uBB38\uC81C\uC790\uC758 \uAE30\uCD08 \uC2EC\uBC95. \uB2E8\uC804\uC774 \uBE68\uB9AC \uC7A1\uD788\uB098 \uAE4A\uC774\uB294 \uB354\uB514\uB2E4.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest"
      },
      {
        id: "hwasan-maehwa-yangsaeng-gong",
        name: "\uB9E4\uD654\uC591\uC0DD\uACF5",
        hanjaName: "\u6885\u82B1\u990A\u751F\u529F",
        description: "\uB9E4\uD654\uC758 \uACB0\uB85C \uAE30\uD608\uC744 \uACE0\uB974\uB294 \uC591\uC0DD\uC758 \uD638\uD761. \uADF8\uB987\uC744 \uCC9C\uCC9C\uD788 \uB113\uD78C\uB2E4.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "maehwa-gigong", minSeong: 2 }]
      },
      {
        id: "hwasan-jaha-simgyeol",
        name: "\uC790\uD558\uC2EC\uACB0",
        hanjaName: "\u7D2B\u971E\u5FC3\u8A23",
        description: "\uC790\uD558\uC2E0\uACF5\uC73C\uB85C \uAC00\uB294 \uAE38\uBAA9\uC758 \uAD6C\uACB0. \uBCF4\uB78F\uBE5B \uAE30\uC6B4\uC758 \uC2E4\uB9C8\uB9AC\uB97C \uC7A1\uB294\uB2E4.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "maehwa-gigong", minSeong: 4 }]
      },
      {
        id: "hwasan-undae-simbeop",
        name: "\uC6B4\uB300\uC2EC\uBC95",
        hanjaName: "\u96F2\u81FA\u5FC3\u6CD5",
        description: "\uC6B4\uB300\uBD09\uC758 \uAD6C\uB984\uCC98\uB7FC \uB290\uB9AC\uACE0 \uB450\uD141\uAC8C \uC313\uB294 \uD654\uC0B0\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "hwasan-maehwa-yangsaeng-gong", minSeong: 3 }]
      },
      {
        id: "hwasan-maehwa-jowon-gong",
        name: "\uB9E4\uD654\uC870\uC6D0\uACF5",
        hanjaName: "\u6885\u82B1\u671D\u5143\u529F",
        description: "\uD769\uC5B4\uC9C4 \uAE30\uB97C \uB9E4\uD654 \uD55C \uC1A1\uC774\uB85C \uBAA8\uC544 \uB2E8\uC804\uC5D0 \uB3CC\uB9AC\uB294 \uD654\uC0B0 \uC0C1\uC2B9 \uC2EC\uBC95.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [
          { artId: "hwasan-jaha-simgyeol", minSeong: 5 },
          { artId: "hwasan-undae-simbeop", minSeong: 4 }
        ]
      },
      {
        id: "jaha-singong",
        name: "\uC790\uD558\uC2E0\uACF5",
        hanjaName: "\u7D2B\u971E\u795E\u529F",
        description: "\uC628\uBAB8\uC5D0 \uC790\uC90F\uBE5B \uAE30\uB958\uAC00 \uD750\uB974\uB294 \uD654\uC0B0 \uC7A5\uBB38 \uBE44\uC804 \uC2EC\uBC95. \uAC80\uC5D0 \uAE30\uB97C \uB9FA\uD788\uAC8C \uD55C\uB2E4.",
        school: "qigong",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "maehwa-gigong", minSeong: 6 }]
      },
      // ─── 보법(lightness) 4 — 낙화보 → 암향표/매향신법 → 비매신법 ───
      {
        id: "hwasan-nakhwa-bo",
        name: "\uB099\uD654\uBCF4",
        hanjaName: "\u843D\u82B1\u6B65",
        description: "\uC9C0\uB294 \uAF43\uC78E\uCC98\uB7FC \uAC00\uBCCD\uAC8C \uB0B4\uB824\uC11C\uB294 \uD654\uC0B0\uC758 \uAE30\uCD08 \uBCF4\uBC95.",
        school: "lightness",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 3 }]
      },
      {
        id: "amhyang-pyo",
        name: "\uC554\uD5A5\uD45C",
        hanjaName: "\u6697\u9999\u98C4",
        description: "\uB9E4\uD654 \uD5A5\uC774 \uBC14\uB78C\uC5D0 \uB5A0\uB3CC\uB4EF \uC885\uC801 \uC5C6\uC774 \uD750\uB974\uB294 \uD654\uC0B0\uC758 \uACBD\uACF5.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "hwasan-maehyang-sinbeop",
        name: "\uB9E4\uD5A5\uC2E0\uBC95",
        hanjaName: "\u6885\u9999\u8EAB\u6CD5",
        description: "\uB9E4\uD654 \uD5A5\uC744 \uB530\uB77C \uBBF8\uB044\uB7EC\uC9C0\uB4EF \uC790\uB9AC\uB97C \uBC14\uAFB8\uB294 \uD654\uC0B0\uC758 \uC2E0\uBC95.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "hwasan-nakhwa-bo", minSeong: 3 }]
      },
      {
        id: "hwasan-bimae-sinbeop",
        name: "\uBE44\uB9E4\uC2E0\uBC95",
        hanjaName: "\u98DB\u6885\u8EAB\u6CD5",
        description: "\uBC14\uB78C\uC5D0 \uB0A0\uB9AC\uB294 \uB9E4\uD654\uCC98\uB7FC \uC885\uC801\uC774 \uD769\uC5B4\uC9C0\uB294 \uD654\uC0B0 \uC2E0\uBC95\uC758 \uC815\uC218.",
        school: "lightness",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [
          { artId: "amhyang-pyo", minSeong: 5 },
          { artId: "hwasan-maehyang-sinbeop", minSeong: 4 }
        ]
      },
      // ─── 권(fist) 4 — 매화수 → 금나수/매화장 → 자하장 ───
      {
        id: "hwasan-maehwa-su",
        name: "\uB9E4\uD654\uC218",
        hanjaName: "\u6885\u82B1\u624B",
        description: "\uAC80\uC744 \uC950\uAE30 \uC804 \uC190\uBD80\uD130 \uB2E4\uB4EC\uB294 \uD654\uC0B0\uC758 \uAE30\uCD08 \uC218\uBC95.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest"
      },
      {
        id: "hwasan-geumna-su",
        name: "\uD654\uC0B0\uAE08\uB098\uC218",
        hanjaName: "\u83EF\u5C71\u64D2\u62FF\u624B",
        description: "\uC0C1\uB300\uC758 \uC190\uBAA9\uACFC \uD608\uC744 \uC7A1\uC544 \uAEBE\uB294 \uD654\uC0B0\uC758 \uAE08\uB098\uC220.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "hwasan-maehwa-su", minSeong: 2 }]
      },
      {
        id: "hwasan-maehwa-jang",
        name: "\uB9E4\uD654\uC7A5",
        hanjaName: "\u6885\u82B1\u638C",
        description: "\uC7A5\uC2EC\uC5D0 \uB9E4\uD654 \uBB38\uC591\uC774 \uC5B4\uB9B0\uB2E4\uB294 \uD654\uC0B0\uC758 \uC7A5\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "hwasan-maehwa-su", minSeong: 3 }]
      },
      {
        id: "hwasan-jaha-jang",
        name: "\uC790\uD558\uC7A5",
        hanjaName: "\u7D2B\u971E\u638C",
        description: "\uC790\uC90F\uBE5B \uAE30\uC6B4\uC744 \uC7A5\uB825\uC5D0 \uC2E4\uC5B4 \uCE58\uB294 \uD654\uC0B0 \uC0C1\uC2B9 \uC7A5\uBC95.",
        school: "fist",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [
          { artId: "hwasan-maehwa-jang", minSeong: 5 },
          { artId: "hwasan-jaha-simgyeol", minSeong: 4 }
        ]
      },
      // ─── 외공(external) 2 — 암벽공 → 반석공 ───
      {
        id: "hwasan-ambyeok-gong",
        name: "\uC554\uBCBD\uACF5",
        hanjaName: "\u5DD6\u58C1\u529F",
        description: "\uD654\uC0B0\uC758 \uBC14\uC704\uBCBD\uC5D0 \uBAB8\uC744 \uBD80\uB52A\uCCD0 \uB2E4\uC9C0\uB294 \uAE30\uCD08 \uC678\uACF5.",
        school: "external",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "hwasan-maehwa-su", minSeong: 3 }]
      },
      {
        id: "hwasan-banseok-gong",
        name: "\uCCA0\uADFC\uACF5",
        hanjaName: "\u9435\u7B4B\u529F",
        description: "\uBC18\uC11D\uCC98\uB7FC \uD754\uB4E4\uB9AC\uC9C0 \uC54A\uB294 \uBAB8\uC744 \uB9CC\uB4DC\uB294 \uD654\uC0B0\uC758 \uC678\uACF5.",
        school: "external",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "hwasan",
        acquisition: "quest",
        prerequisites: [{ artId: "hwasan-ambyeok-gong", minSeong: 4 }]
      }
    ];
  }
});

// src/data/martialArts/catalog/mudang.ts
var MUDANG_ARTS;
var init_mudang = __esm({
  "src/data/martialArts/catalog/mudang.ts"() {
    "use strict";
    MUDANG_ARTS = [
      // ─── 검(sword) 12 — 현문기초 → 송문/양의 분기 → 사상·진무·현허 → 팔괘·현천 → 태극검·무극검 ───
      {
        id: "hyeonmun-gicho-sword",
        name: "\uD604\uBB38\uAE30\uCD08\uAC80",
        hanjaName: "\u7384\u9580\u57FA\u790E\u528D",
        description: "\uBB34\uB2F9 \uB3C4\uBB38\uC758 \uC785\uBB38 \uAC80. \uACE7\uACE0 \uB290\uB9AC\uB098 \uD750\uD2B8\uB7EC\uC9D0\uC774 \uC5C6\uB2E4.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest"
      },
      {
        id: "mudang-songmun-sword",
        name: "\uC1A1\uBB38\uAC80\uBC95",
        hanjaName: "\u677E\u7D0B\u528D\u6CD5",
        description: "\uC18C\uB098\uBB34 \uACB0\uC744 \uB530\uB77C \uACE7\uAC8C \uAE0B\uB294 \uBB34\uB2F9\uC758 \uAE30\uCD08 \uAC80. \uB290\uB824\uB3C4 \uC5B4\uAE0B\uB0A8\uC774 \uC5C6\uB2E4.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "hyeonmun-gicho-sword", minSeong: 2 }]
      },
      {
        id: "yangui-sword",
        name: "\uC591\uC758\uAC80\uBC95",
        hanjaName: "\u5169\u5100\u528D\u6CD5",
        description: "\uC74C\uC591 \uB450 \uACB0\uC744 \uAC08\uB77C \uC4F0\uB294 \uBB34\uB2F9 \uAC80. \uC88C\uC6B0\uAC00 \uC11C\uB85C \uB2E4\uB978 \uAC80\uC744 \uD3B8\uB2E4.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "hyeonmun-gicho-sword", minSeong: 3 }]
      },
      {
        id: "mudang-sasang-sword",
        name: "\uC0AC\uC0C1\uAC80\uBC95",
        hanjaName: "\u56DB\u8C61\u528D\u6CD5",
        description: "\uC591\uC758\uC5D0\uC11C \uAC08\uB77C\uC9C4 \uB124 \uACB0\uC758 \uAC80. \uC0AC\uC0C1\uC758 \uC790\uB9AC\uB97C \uBC88\uAC08\uC544 \uBC1F\uB294\uB2E4.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "yangui-sword", minSeong: 3 }]
      },
      {
        id: "mudang-jinmu-sword",
        name: "\uC9C4\uBB34\uAC80\uBC95",
        hanjaName: "\u771E\u6B66\u528D\u6CD5",
        description: "\uC9C4\uBB34\uB300\uC81C\uB97C \uBAA8\uC2DC\uB294 \uB3C4\uBB38\uC758 \uAC80. \uBB34\uAC81\uACE0 \uBC14\uB974\uB2E4.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "mudang-songmun-sword", minSeong: 3 }]
      },
      {
        id: "mudang-hyeonheo-sword",
        name: "\uD604\uD5C8\uAC80\uBC95",
        hanjaName: "\u7384\u865B\u528D\u6CD5",
        description: "\uBE44\uC5B4 \uC788\uC5B4 \uC624\uD788\uB824 \uB9C9\uC744 \uC218 \uC5C6\uB294 \uBB34\uB2F9\uC758 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "mudang-songmun-sword", minSeong: 4 }]
      },
      {
        id: "mudang-baekhak-sword",
        name: "\uBC31\uD559\uAC80\uBC95",
        hanjaName: "\u767D\u9DB4\u528D\u6CD5",
        description: "\uD559\uC774 \uB0A0\uAC1C\uB97C \uD3B4\uB4EF \uD06C\uAC8C \uC5F4\uACE0 \uAC00\uBCCD\uAC8C \uB2EB\uB294 \uBB34\uB2F9\uC758 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "yangui-sword", minSeong: 4 }]
      },
      {
        id: "chilseong-sword",
        name: "\uCE60\uC131\uAC80",
        hanjaName: "\u4E03\u661F\u528D",
        description: "\uBD81\uB450\uCE60\uC131\uC758 \uC790\uB9AC\uB97C \uBC1F\uC73C\uBA70 \uD3BC\uCE58\uB294 \uBB34\uB2F9 \uC0C1\uC2B9 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "yangui-sword", minSeong: 5 }]
      },
      {
        id: "mudang-palgwae-sword",
        name: "\uD314\uAD18\uAC80",
        hanjaName: "\u516B\u5366\u528D",
        description: "\uD314\uAD18\uC758 \uBC29\uC704\uB97C \uBC1F\uC73C\uBA70 \uB3C4\uB294 \uBB34\uB2F9 \uC0C1\uC2B9 \uAC80. \uC5B4\uB290 \uBC29\uD5A5\uC5D0\uB3C4 \uB4F1\uC774 \uC5C6\uB2E4.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "mudang-sasang-sword", minSeong: 5 }]
      },
      {
        id: "mudang-hyeoncheon-sword",
        name: "\uBD81\uB450\uAC80\uBC95",
        hanjaName: "\u5317\u6597\u528D\u6CD5",
        description: "\uD604\uCC9C\uC0C1\uC81C\uC758 \uC704\uC5C4\uC744 \uAC80\uC5D0 \uC2E4\uC740 \uBB34\uB2F9 \uC0C1\uC2B9 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [
          { artId: "mudang-jinmu-sword", minSeong: 5 },
          { artId: "mudang-hyeonheo-sword", minSeong: 4 }
        ]
      },
      {
        id: "taegeuk-sword",
        name: "\uD0DC\uADF9\uAC80",
        hanjaName: "\u592A\u6975\u528D",
        description: "\uC6D0\uC73C\uB85C \uC9C1\uC120\uC744 \uC774\uAE30\uB294 \uBB34\uB2F9 \uBE44\uC804. \uBD80\uB4DC\uB7EC\uC6C0\uC774 \uB05D\uB0B4 \uAC15\uD568\uC744 \uC0BC\uD0A8\uB2E4.",
        school: "sword",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [
          { artId: "chilseong-sword", minSeong: 6 },
          { artId: "taehwa-simbeop", minSeong: 5 }
        ]
      },
      {
        id: "mudang-mugeuk-sword",
        name: "\uBB34\uADF9\uAC80",
        hanjaName: "\u7121\u6975\u528D",
        description: "\uD0DC\uADF9\uBCF4\uB2E4 \uC55E\uC120 \uBB34\uADF9\uC758 \uC774\uCE58 \u2014 \uD615\uC774 \uC0AC\uB77C\uC9C4 \uC790\uB9AC\uC5D0 \uAC80\uB9CC \uB0A8\uB294\uB2E4.",
        school: "sword",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [
          { artId: "mudang-palgwae-sword", minSeong: 6 },
          { artId: "mudang-hyeoncheon-sword", minSeong: 5 }
        ]
      },
      // ─── 심법(qigong) 7 — 태화 → 청정/양의·사상귀원 → 순양·오기조원 → 삼화취정 ───
      {
        id: "taehwa-simbeop",
        name: "\uD0DC\uD654\uC2EC\uBC95",
        hanjaName: "\u592A\u548C\u5FC3\u6CD5",
        description: "\uBB34\uB2F9 \uC785\uBB38\uC81C\uC790\uC758 \uAE30\uCD08 \uC2EC\uBC95. \uD638\uD761\uC774 \uAE38\uACE0 \uACE0\uC694\uD558\uB2E4.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest"
      },
      {
        id: "mudang-cheongjeong-gong",
        name: "\uCCAD\uC815\uACF5",
        hanjaName: "\u6DF8\u975C\u529F",
        description: "\uB9D1\uACE0 \uACE0\uC694\uD568\uC744 \uC9C0\uD0A4\uB294 \uB3C4\uAC00\uC758 \uAD6C\uACB0. \uB9C8\uC74C\uC774 \uAC00\uB77C\uC549\uC544\uC57C \uAE30\uAC00 \uBAA8\uC778\uB2E4.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "taehwa-simbeop", minSeong: 2 }]
      },
      {
        id: "mudang-yangui-simgong",
        name: "\uC591\uC758\uC2EC\uACF5",
        hanjaName: "\u5169\u5100\u5FC3\u529F",
        description: "\uC74C\uACFC \uC591 \uB450 \uAC08\uB798 \uAE30\uC6B4\uC744 \uB098\uB204\uC5B4 \uAE30\uB974\uB294 \uBB34\uB2F9\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "taehwa-simbeop", minSeong: 4 }]
      },
      {
        id: "mudang-sasang-gwiwon-gong",
        name: "\uC0AC\uC0C1\uADC0\uC6D0\uACF5",
        hanjaName: "\u56DB\u8C61\u6B78\u5143\u529F",
        description: "\uB124 \uAC08\uB798\uB85C \uD769\uC5B4\uC9C4 \uAE30\uB97C \uADFC\uC6D0\uC73C\uB85C \uB418\uB3CC\uB9AC\uB294 \uBB34\uB2F9\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "mudang-cheongjeong-gong", minSeong: 3 }]
      },
      {
        id: "sunyang-mugeuk-gong",
        name: "\uC21C\uC591\uBB34\uADF9\uACF5",
        hanjaName: "\u7D14\u967D\u7121\u6975\u529F",
        description: "\uC21C\uC591\uC758 \uAE30\uB97C \uBB34\uADF9\uC73C\uB85C \uC313\uB294 \uBB34\uB2F9 \uC0C1\uC2B9 \uC2EC\uBC95. \uC7A5\uC0BC\uBD09 \uC804\uC2B9\uC774\uB77C \uC804\uD55C\uB2E4.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "taehwa-simbeop", minSeong: 6 }]
      },
      {
        id: "mudang-ogi-jowon-gong",
        name: "\uC624\uAE30\uC870\uC6D0\uACF5",
        hanjaName: "\u4E94\u6C23\u671D\u5143\u529F",
        description: "\uC624\uC7A5\uC758 \uAE30\uB97C \uBA38\uB9AC \uC704 \uD55C \uC810\uC73C\uB85C \uBAA8\uC740\uB2E4\uB294 \uB3C4\uAC00 \uC0C1\uC2B9 \uC2EC\uBC95.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [
          { artId: "mudang-yangui-simgong", minSeong: 5 },
          { artId: "mudang-sasang-gwiwon-gong", minSeong: 4 }
        ]
      },
      {
        id: "mudang-samhwa-chwijeong-gong",
        name: "\uC0BC\uD654\uCDE8\uC815\uACF5",
        hanjaName: "\u4E09\u82B1\u805A\u9802\u529F",
        description: "\uC138 \uC1A1\uC774 \uAF43\uC774 \uC815\uC218\uB9AC\uC5D0 \uB9FA\uD78C\uB2E4 \u2014 \uB3C4\uAC00 \uB0B4\uB2E8\uC758 \uB192\uC740 \uACBD\uC9C0.",
        school: "qigong",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [
          { artId: "sunyang-mugeuk-gong", minSeong: 6 },
          { artId: "mudang-ogi-jowon-gong", minSeong: 5 }
        ]
      },
      // ─── 권(fist) 5 — 운수장 → 십단금/면장 → 태극권 → 태극십삼세 ───
      {
        id: "mudang-unsu-jang",
        name: "\uC6B4\uC218\uC7A5",
        hanjaName: "\u96F2\u624B\u638C",
        description: "\uAD6C\uB984\uC744 \uC4F8 \uB4EF \uC190\uC744 \uAD74\uB9AC\uB294 \uBB34\uB2F9\uC758 \uAE30\uCD08 \uC7A5\uBC95.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "taehwa-simbeop", minSeong: 2 }]
      },
      {
        id: "sipdan-geum",
        name: "\uC2ED\uB2E8\uAE08",
        hanjaName: "\u5341\u6BB5\u9326",
        description: "\uC5F4 \uB2E8\uC73C\uB85C \uB04A\uC5B4 \uCE58\uB294 \uBB34\uB2F9\uC758 \uC7A5\uBC95. \uBD80\uB4DC\uB7EC\uC6B4 \uAC89\uC5D0 \uB04A\uB294 \uD798\uC744 \uC228\uACBC\uB2E4.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest"
      },
      {
        id: "mudang-myeonjang",
        name: "\uBB34\uB2F9\uBA74\uC7A5",
        hanjaName: "\u6B66\u7576\u7DBF\u638C",
        description: "\uC19C\uCC98\uB7FC \uBD80\uB4DC\uB7FD\uAC8C \uB2FF\uC544 \uC18D\uC744 \uC6B8\uB9AC\uB294 \uBB34\uB2F9\uC758 \uC7A5\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "mudang-unsu-jang", minSeong: 3 }]
      },
      {
        id: "taegeuk-gwon",
        name: "\uD0DC\uADF9\uAD8C",
        hanjaName: "\u592A\u6975\u62F3",
        description: "\uB290\uB9B0 \uC6D0\uC774 \uBE60\uB978 \uC8FC\uBA39\uC744 \uC774\uAE34\uB2E4 \u2014 \uBB34\uB2F9 \uAD8C\uBC95\uC758 \uC815\uC218.",
        school: "fist",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "sipdan-geum", minSeong: 5 }, { artId: "taehwa-simbeop", minSeong: 4 }]
      },
      {
        id: "mudang-taegeuk-sipsamse",
        name: "\uD0DC\uADF9\uC2ED\uC0BC\uC138",
        hanjaName: "\u592A\u6975\u5341\u4E09\u52E2",
        description: "\uC5F4\uC138 \uAC00\uC9C0 \uD798\uC774 \uD558\uB098\uC758 \uC6D0\uC73C\uB85C \uB3CC\uC544\uC628\uB2E4 \u2014 \uBB34\uB2F9 \uAD8C\uC7A5\uC758 \uC815\uC810.",
        school: "fist",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [
          { artId: "taegeuk-gwon", minSeong: 6 },
          { artId: "mudang-myeonjang", minSeong: 5 }
        ]
      },
      // ─── 보법(lightness) 4 — 송풍보 → 답운보 → 제운종/구궁보 ───
      {
        id: "mudang-songpung-bo",
        name: "\uC1A1\uD48D\uBCF4",
        hanjaName: "\u677E\u98A8\u6B65",
        description: "\uC194\uBC14\uB78C\uCC98\uB7FC \uC18C\uB9AC \uC5C6\uC774 \uD750\uB974\uB294 \uBB34\uB2F9\uC758 \uAE30\uCD08 \uBCF4\uBC95.",
        school: "lightness",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 3 }]
      },
      {
        id: "mudang-dapun-bo",
        name: "\uCC9C\uAC15\uBCF4",
        hanjaName: "\u5929\u7F61\u6B65",
        description: "\uAD6C\uB984\uC744 \uBC1F\uB4EF \uC0AC\uBFD0\uD788 \uC790\uB9AC\uB97C \uC62E\uAE30\uB294 \uBB34\uB2F9\uC758 \uBCF4\uBC95.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "mudang-songpung-bo", minSeong: 3 }]
      },
      {
        id: "jeunjong",
        name: "\uC81C\uC6B4\uC885",
        hanjaName: "\u68AF\u96F2\u7E31",
        description: "\uAD6C\uB984\uC744 \uC0AC\uB2E4\uB9AC \uC0BC\uC544 \uC624\uB974\uB294 \uBB34\uB2F9 \uACBD\uACF5. \uD5C8\uACF5\uC744 \uB450 \uBC88 \uBC1F\uB294\uB2E4.",
        school: "lightness",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 5 }]
      },
      {
        id: "mudang-gugung-bo",
        name: "\uAD6C\uAD81\uBCF4",
        hanjaName: "\u4E5D\u5BAE\u6B65",
        description: "\uAD6C\uAD81\uC758 \uC790\uB9AC\uB97C \uCC28\uB840\uB85C \uBC1F\uC544 \uC801\uC758 \uB208\uC744 \uD750\uB9AC\uB294 \uBB34\uB2F9 \uC0C1\uC2B9 \uBCF4\uBC95.",
        school: "lightness",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "mudang-dapun-bo", minSeong: 5 }]
      },
      // ─── 외공(external) 2 — 도인공 → 현무공 ───
      {
        id: "mudang-doin-gong",
        name: "\uC9C4\uBB34\uACF5",
        hanjaName: "\u771E\u6B66\u529F",
        description: "\uBAB8\uC744 \uB298\uC774\uACE0 \uAD7D\uD600 \uADFC\uACE8\uC744 \uACE0\uB974\uB294 \uB3C4\uAC00\uC758 \uAE30\uCD08 \uB2E8\uB828\uBC95.",
        school: "external",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "mudang-cheongjeong-gong", minSeong: 2 }]
      },
      {
        id: "mudang-hyeonmu-gong",
        name: "\uD604\uBB34\uACF5",
        hanjaName: "\u7384\u6B66\u529F",
        description: "\uD604\uBB34\uC758 \uB4F1\uB531\uC9C0\uCC98\uB7FC \uB2E8\uB2E8\uD558\uAC8C \uBAB8\uC744 \uB2EB\uB294 \uBB34\uB2F9\uC758 \uC678\uACF5.",
        school: "external",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "mudang",
        acquisition: "quest",
        prerequisites: [{ artId: "mudang-doin-gong", minSeong: 4 }]
      }
    ];
  }
});

// src/data/martialArts/catalog/sorim.ts
var SORIM_ARTS;
var init_sorim = __esm({
  "src/data/martialArts/catalog/sorim.ts"() {
    "use strict";
    SORIM_ARTS = [
      // ─── 권(fist) 13 — 장권/나한권 두 뿌리 → 오권·통비·복호·반야·금강 → 백보·대력·백팔나한·반야금강 → 여래신장·항마신권 ───
      {
        id: "sorim-janggwon",
        name: "\uC18C\uB9BC\uC7A5\uAD8C",
        hanjaName: "\u5C11\u6797\u9577\u62F3",
        description: "\uC18C\uB9BC \uBB34\uC2B9\uC774 \uCC98\uC74C \uBC30\uC6B0\uB294 \uC7A5\uAD8C. \uD06C\uACE0 \uBC14\uB978 \uD615\uC774 \uBAA8\uB4E0 \uAD8C\uC758 \uBC14\uD0D5.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest"
      },
      {
        id: "sorim-ogwon",
        name: "\uC18C\uB9BC\uC624\uAD8C",
        hanjaName: "\u5C11\u6797\u4E94\u62F3",
        description: "\uC6A9\xB7\uD638\xB7\uD45C\xB7\uC0AC\xB7\uD559 \uB2E4\uC12F \uC9D0\uC2B9\uC758 \uACB0\uC744 \uB2F4\uC740 \uC18C\uB9BC \uC804\uD1B5 \uAD8C\uBC95.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [{ artId: "sorim-janggwon", minSeong: 2 }]
      },
      {
        id: "nahan-fist",
        name: "\uB098\uD55C\uAD8C",
        hanjaName: "\u7F85\u6F22\u62F3",
        description: "\uBC31\uD314\uB098\uD55C\uC758 \uD615\uC744 \uBCF8\uB72C \uC18C\uB9BC \uAD8C\uBC95. \uBAA8\uB4E0 \uC18C\uB9BC \uAD8C\uC758 \uC2DC\uC791.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest"
      },
      {
        id: "sorim-tongbi-gwon",
        name: "\uD1B5\uBE44\uAD8C",
        hanjaName: "\u901A\u81C2\u62F3",
        description: "\uC5B4\uAE68\uC640 \uB4F1\uC744 \uAFF0\uC5B4 \uD314\uC744 \uCC44\uCC0D\uCC98\uB7FC \uBED7\uB294 \uC18C\uB9BC \uC804\uD1B5 \uAD8C\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [{ artId: "sorim-janggwon", minSeong: 3 }]
      },
      {
        id: "sorim-bokho-gwon",
        name: "\uBCF5\uD638\uAD8C",
        hanjaName: "\u4F0F\u864E\u62F3",
        description: "\uD638\uB791\uC774\uB97C \uC5CE\uB4DC\uB9AC\uAC8C \uD558\uB294 \uAE30\uC138\uB85C \uB0B4\uB9AC\uCC0D\uB294 \uC18C\uB9BC \uAD8C\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [{ artId: "sorim-ogwon", minSeong: 3 }]
      },
      {
        id: "sorim-banya-jang",
        name: "\uBC18\uC57C\uC7A5",
        hanjaName: "\u822C\u82E5\u638C",
        description: "\uBC18\uC57C\uC758 \uC9C0\uD61C\uB97C \uC7A5\uB825\uC5D0 \uC2E3\uB294 \uC18C\uB9BC \uC7A5\uBC95. \uBD80\uB4DC\uB7EC\uC6B4 \uAC89\uC5D0 \uBB34\uAC70\uC6B4 \uC18D.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [{ artId: "nahan-fist", minSeong: 3 }]
      },
      {
        id: "sorim-geumgang-gwon",
        name: "\uAE08\uAC15\uAD8C",
        hanjaName: "\u91D1\u525B\u62F3",
        description: "\uAE08\uAC15\uC5ED\uC0AC\uC758 \uD615\uC744 \uBCF8\uB72C \uC18C\uB9BC \uAD8C\uBC95. \uD55C \uC8FC\uBA39 \uD55C \uC8FC\uBA39\uC774 \uBC14\uC704 \uAC19\uB2E4.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [{ artId: "sorim-janggwon", minSeong: 4 }]
      },
      {
        id: "baekbo-singwon",
        name: "\uBC31\uBCF4\uC2E0\uAD8C",
        hanjaName: "\u767E\u6B65\u795E\u62F3",
        description: "\uBC31 \uBCF4 \uBC16\uC758 \uC801\uC744 \uCE58\uB294 \uACA9\uACF5\uC758 \uAD8C. \uB098\uD55C\uAD8C\uC758 \uACB0\uC774 \uBB34\uB974\uC775\uC5B4\uC57C \uC7A1\uD78C\uB2E4.",
        school: "fist",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [{ artId: "nahan-fist", minSeong: 5 }]
      },
      {
        id: "daeryeok-geumgang-su",
        name: "\uB300\uB825\uAE08\uAC15\uC218",
        hanjaName: "\u5927\u529B\u91D1\u525B\u624B",
        description: "\uBC14\uC704\uB97C \uBAA8\uB798\uCC98\uB7FC \uBD80\uC218\uB294 \uC18C\uB9BC \uC218\uACF5. \uB098\uD55C\uAD8C\uC5D0\uC11C \uAC08\uB77C\uC9C4 \uAC15\uB9F9\uC758 \uAE38.",
        school: "fist",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [{ artId: "nahan-fist", minSeong: 5 }]
      },
      {
        id: "sorim-baekpal-nahan-gwon",
        name: "\uBC31\uD314\uB098\uD55C\uAD8C",
        hanjaName: "\u767E\u516B\u7F85\u6F22\u62F3",
        description: "\uBC31\uD314\uB098\uD55C\uC774 \uCC28\uB840\uB85C \uD604\uC2E0\uD558\uB4EF \uB05D\uC5C6\uC774 \uC774\uC5B4\uC9C0\uB294 \uB098\uD55C\uAD8C\uC758 \uAE4A\uC740 \uACBD\uC9C0.",
        school: "fist",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [
          { artId: "nahan-fist", minSeong: 5 },
          { artId: "sorim-bokho-gwon", minSeong: 4 }
        ]
      },
      {
        id: "sorim-banya-geumgang-jang",
        name: "\uBC18\uC57C\uAE08\uAC15\uC7A5",
        hanjaName: "\u822C\u82E5\u91D1\u525B\u638C",
        description: "\uC9C0\uD61C\uC640 \uD798\uC774 \uD55C \uC7A5\uC5D0 \uBAA8\uC778\uB2E4 \u2014 \uBC18\uC57C\uC7A5\uACFC \uAE08\uAC15\uAD8C\uC774 \uB9CC\uB098\uB294 \uC790\uB9AC.",
        school: "fist",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [
          { artId: "sorim-banya-jang", minSeong: 5 },
          { artId: "sorim-geumgang-gwon", minSeong: 4 }
        ]
      },
      {
        id: "yeorae-sinjang",
        name: "\uC5EC\uB798\uC2E0\uC7A5",
        hanjaName: "\u5982\u4F86\u795E\u638C",
        description: "\uD5C8\uACF5\uC5D0 \uAC70\uB300\uD55C \uAE08\uBE5B \uC190\uC774 \uB9FA\uD788\uB294 \uC18C\uB9BC \uCE60\uC2ED\uC774\uC608\uC758 \uC815\uC810. \uBC31 \uB144\uC5D0 \uD55C \uC0AC\uB78C \uC787\uAE30 \uC5B4\uB835\uB2E4.",
        school: "fist",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [
          { artId: "baekbo-singwon", minSeong: 6 },
          { artId: "daeryeok-geumgang-su", minSeong: 5 }
        ]
      },
      {
        id: "sorim-hangma-singwon",
        name: "\uD56D\uB9C8\uC2E0\uAD8C",
        hanjaName: "\u964D\u9B54\u795E\u62F3",
        description: "\uB9C8\uB97C \uAD74\uBCF5\uC2DC\uD0A4\uB294 \uBD84\uB178\uC874\uC758 \uAD8C. \uC790\uBE44\uB85C\uC6B4 \uB9C8\uC74C\uC774\uB77C\uC57C \uB05D\uAE4C\uC9C0 \uB2E6\uB294\uB2E4.",
        school: "fist",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [
          { artId: "sorim-baekpal-nahan-gwon", minSeong: 6 },
          { artId: "sorim-banya-geumgang-jang", minSeong: 5 }
        ]
      },
      // ─── 도(saber) 1 — 계도 ───
      {
        id: "sorim-gyedo-beop",
        name: "\uC18C\uB9BC\uACC4\uB3C4\uBC95",
        hanjaName: "\u5C11\u6797\u6212\u5200\u6CD5",
        description: "\uACC4\uC728\uC744 \uC9C0\uD0A4\uB294 \uCE7C \u2014 \uBCA0\uAE30\uBCF4\uB2E4 \uB9C9\uAE30\uC5D0 \uCDA9\uC2E4\uD55C \uC18C\uB9BC \uBB34\uC2B9\uC758 \uB3C4\uBC95.",
        school: "saber",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [{ artId: "dongja-gong", minSeong: 3 }]
      },
      // ─── 외공(external) 7 — 동자공 → 철두/철포삼/철사장/일지선 → 동인공 → 금강불괴 ───
      {
        id: "dongja-gong",
        name: "\uB3D9\uC790\uACF5",
        hanjaName: "\u7AE5\u5B50\u529F",
        description: "\uC5B4\uB9B4 \uB54C\uBD80\uD130 \uB2E6\uC544\uC57C \uD070 \uADF8\uB987\uC774 \uB418\uB294 \uC18C\uB9BC \uAE30\uCD08 \uC678\uACF5.",
        school: "external",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest"
      },
      {
        id: "sorim-cheoldu-gong",
        name: "\uCCA0\uB450\uACF5",
        hanjaName: "\u9435\u982D\u529F",
        description: "\uC774\uB9C8\uB85C \uBE44\uC11D\uC744 \uAC00\uB978\uB2E4\uB294 \uC18C\uB9BC\uC758 \uAE30\uCD08 \uC678\uACF5.",
        school: "external",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [{ artId: "dongja-gong", minSeong: 2 }]
      },
      {
        id: "cheolpo-sam",
        name: "\uCCA0\uD3EC\uC0BC",
        hanjaName: "\u9435\u5E03\u886B",
        description: "\uC1E0 \uCC9C\uC744 \uB450\uB978 \uB4EF \uBAB8\uC774 \uB2E8\uB2E8\uD574\uC9C0\uB294 \uC18C\uB9BC \uC678\uACF5.",
        school: "external",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [{ artId: "dongja-gong", minSeong: 4 }]
      },
      {
        id: "sorim-cheolsa-jang",
        name: "\uCCA0\uC0AC\uC7A5",
        hanjaName: "\u9435\u7802\u638C",
        description: "\uB728\uAC70\uC6B4 \uCCA0\uBAA8\uB798\uC5D0 \uC190\uC744 \uBC15\uC544 \uB2E8\uB828\uD558\uB294 \uC18C\uB9BC \uC678\uACF5. \uC190\uBC14\uB2E5\uC774 \uBB34\uC1E0\uAC00 \uB41C\uB2E4.",
        school: "external",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [{ artId: "dongja-gong", minSeong: 4 }]
      },
      {
        id: "sorim-ilji-seon",
        name: "\uC77C\uC9C0\uC120",
        hanjaName: "\u4E00\u6307\u79AA",
        description: "\uD55C \uC190\uAC00\uB77D\uC5D0 \uC804\uC2E0\uC758 \uACF5\uB825\uC744 \uBAA8\uC73C\uB294 \uC18C\uB9BC \uC678\uACF5\uC758 \uC808\uC608.",
        school: "external",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [{ artId: "cheolpo-sam", minSeong: 3 }]
      },
      {
        id: "sorim-dongin-gong",
        name: "\uB3D9\uC778\uACF5",
        hanjaName: "\u9285\u4EBA\u529F",
        description: "\uC18C\uB9BC \uB3D9\uC778\uCC98\uB7FC \uB450\uB4DC\uB9B4\uC218\uB85D \uB2E8\uB2E8\uD574\uC9C0\uB294 \uC0C1\uC2B9 \uC678\uACF5.",
        school: "external",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [
          { artId: "cheolpo-sam", minSeong: 5 },
          { artId: "sorim-cheoldu-gong", minSeong: 4 }
        ]
      },
      {
        id: "geumgang-bulgoe",
        name: "\uAE08\uAC15\uBD88\uAD34",
        hanjaName: "\u91D1\u525B\u4E0D\u58DE",
        description: "\uAC80\uAE30\uC870\uCC28 \uD295\uACA8\uB0B4\uB294 \uC678\uACF5\uC758 \uCD5C\uACE0\uBD09. \uBAB8\uC774 \uACE7 \uAE08\uAC15\uC774 \uB41C\uB2E4.",
        school: "external",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [{ artId: "cheolpo-sam", minSeong: 6 }]
      },
      // ─── 심법(qigong) 5 — 선정공 → 반야심공/나한기공 → 달마선공 (+역근경) ───
      {
        id: "sorim-seonjeong-gong",
        name: "\uC120\uC815\uACF5",
        hanjaName: "\u79AA\u5B9A\u529F",
        description: "\uC120\uC815\uC5D0 \uB4E4\uC5B4 \uD638\uD761\uC744 \uACE0\uB974\uB294 \uC18C\uB9BC\uC758 \uAE30\uCD08 \uC2EC\uBC95.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [{ artId: "dongja-gong", minSeong: 2 }]
      },
      {
        id: "sorim-banya-simgong",
        name: "\uBC18\uC57C\uC2EC\uACF5",
        hanjaName: "\u822C\u82E5\u5FC3\u529F",
        description: "\uBC18\uC57C\uC758 \uACE0\uC694\uB85C \uB0B4\uAE30\uB97C \uAE30\uB974\uB294 \uC18C\uB9BC \uC2EC\uBC95. \uB9C8\uC74C\uC774 \uB9D1\uC544\uC57C \uAE4A\uC5B4\uC9C4\uB2E4.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [{ artId: "sorim-seonjeong-gong", minSeong: 3 }]
      },
      {
        id: "sorim-nahan-gigong",
        name: "\uB098\uD55C\uAE30\uACF5",
        hanjaName: "\u7F85\u6F22\u6C23\u529F",
        description: "\uB098\uD55C\uC758 \uD615\uC5D0 \uD638\uD761\uC744 \uC2E4\uC5B4 \uAD8C\uACFC \uAE30\uB97C \uD568\uAED8 \uAE30\uB974\uB294 \uC18C\uB9BC \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [{ artId: "sorim-seonjeong-gong", minSeong: 4 }]
      },
      {
        id: "sorim-dalma-seon-gong",
        name: "\uB2EC\uB9C8\uC120\uACF5",
        hanjaName: "\u9054\u78E8\u79AA\u529F",
        description: "\uB2EC\uB9C8\uAC00 \uBA74\uBCBD \uAD6C \uB144\uC5D0 \uC5BB\uC5C8\uB2E4 \uC804\uD558\uB294 \uC18C\uB9BC \uC0C1\uC2B9 \uC2EC\uBC95.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [
          { artId: "sorim-banya-simgong", minSeong: 5 },
          { artId: "sorim-nahan-gigong", minSeong: 4 }
        ]
      },
      {
        id: "yeokgeun-gyeong",
        name: "\uC5ED\uADFC\uACBD",
        hanjaName: "\u6613\u7B4B\u7D93",
        description: "\uADFC\uACE8\uC744 \uAC08\uC544 \uB2E4\uC2DC \uBE5A\uB294 \uC18C\uB9BC \uCD5C\uACE0 \uC2EC\uBC95. \uBD80\uC791\uC6A9 \uC5C6\uB294 \uC720\uC77C\uD55C \uC2E0\uACF5\uC774\uB77C \uC804\uD55C\uB2E4.",
        school: "qigong",
        grade: "legendary",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "achievement"
      },
      // ─── 보법(lightness) 4 — 나한보 → 비첨주벽 → 일위도강/나한신법 ───
      {
        id: "sorim-nahan-bo",
        name: "\uB098\uD55C\uBCF4",
        hanjaName: "\u7F85\u6F22\u6B65",
        description: "\uB098\uD55C\uC0C1\uC758 \uC790\uC138\uC5D0\uC11C \uB098\uC628 \uC18C\uB9BC\uC758 \uAE30\uCD08 \uBCF4\uBC95. \uB0AE\uACE0 \uAD73\uAC74\uD558\uB2E4.",
        school: "lightness",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 3 }]
      },
      {
        id: "sorim-bicheom-jubyeok",
        name: "\uBE44\uCCA8\uC8FC\uBCBD",
        hanjaName: "\u98DB\u7C37\u8D70\u58C1",
        description: "\uCC98\uB9C8\uB97C \uB0A0\uACE0 \uBCBD\uC744 \uB2EC\uB9AC\uB294 \uACBD\uACF5. \uC18C\uB9BC \uBB34\uC2B9\uC758 \uC57C\uD589 \uAC78\uC74C.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [{ artId: "sorim-nahan-bo", minSeong: 3 }]
      },
      {
        id: "ilwi-dogang",
        name: "\uC77C\uC704\uB3C4\uAC15",
        hanjaName: "\u4E00\u8466\u6E21\u6C5F",
        description: "\uB2EC\uB9C8\uAC00 \uAC08\uB300 \uD55C \uC78E\uC73C\uB85C \uC7A5\uAC15\uC744 \uAC74\uB11C\uB2E4\uB294 \uBD88\uAC00 \uBE44\uC804\uC758 \uACBD\uACF5. \uC18C\uB9BC \uBB34\uC2B9\uC758 \uAC78\uC74C.",
        school: "lightness",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 5 }]
      },
      {
        id: "sorim-nahan-sinbeop",
        name: "\uB098\uD55C\uC2E0\uBC95",
        hanjaName: "\u7F85\u6F22\u8EAB\u6CD5",
        description: "\uAD73\uAC74\uD558\uB418 \uBC14\uB78C\uCC98\uB7FC \uC6C0\uC9C1\uC774\uB294 \uC18C\uB9BC \uC2E0\uBC95\uC758 \uC815\uC218.",
        school: "lightness",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "sorim",
        acquisition: "quest",
        prerequisites: [{ artId: "sorim-bicheom-jubyeok", minSeong: 5 }]
      }
    ];
  }
});

// src/data/martialArts/catalog/gaebang.ts
var GAEBANG_ARTS;
var init_gaebang = __esm({
  "src/data/martialArts/catalog/gaebang.ts"() {
    "use strict";
    GAEBANG_ARTS = [
      // ═══ 권·장법 (14) — 유걸권 뿌리 → 타구·취·항룡 세 갈래 ═══════════════════
      {
        id: "yugeol-gwon",
        name: "\uC720\uAC78\uAD8C",
        hanjaName: "\u6D41\u4E5E\u62F3",
        description: "\uB5A0\uB3C4\uB294 \uAC70\uC9C0\uB4E4\uC758 \uB9C9\uAD8C. \uD615\uC740 \uC5C9\uC131\uD574\uB3C4 \uAE38\uBC14\uB2E5\uC5D0\uC11C \uB2E4\uC838\uC9C4 \uC2E4\uC804\uC774\uB2E4.",
        school: "fist",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest"
      },
      {
        id: "gaebang-yurang-gwon",
        name: "\uC720\uB791\uAD8C",
        hanjaName: "\u6D41\u6D6A\u62F3",
        description: "\uC815\uCC98 \uC5C6\uC774 \uB5A0\uB3C4\uB294 \uAC78\uC74C\uC5D0\uC11C \uB098\uC628 \uAD8C. \uBC1C\uAE38 \uB2FF\uB294 \uB300\uB85C \uCE58\uB418 \uBA48\uCD94\uC9C0 \uC54A\uB294\uB2E4.",
        school: "fist",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "yugeol-gwon", minSeong: 2 }]
      },
      {
        id: "gaebang-geolgae-su",
        name: "\uAC78\uAC1C\uC218",
        hanjaName: "\u4E5E\u4E10\u624B",
        description: "\uBC25\uADF8\uB987 \uBE8F\uAE30\uC9C0 \uC54A\uC73C\uB824 \uB2E4\uB4EC\uC740 \uAC70\uC9C0\uB4E4\uC758 \uC190\uC18D. \uC7A1\uACE0 \uBE44\uD2C0\uACE0 \uBE7C\uC557\uB294 \uB370 \uB2A5\uD558\uB2E4.",
        school: "fist",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "yugeol-gwon", minSeong: 2 }]
      },
      {
        id: "gaebang-pungrae-jang",
        name: "\uD48D\uB798\uC7A5",
        hanjaName: "\u98A8\u4F86\u638C",
        description: "\uBC14\uB78C\uC774 \uC624\uB294 \uACB0\uC744 \uD0C0\uACE0 \uBBF8\uB294 \uAC1C\uBC29\uC758 \uAE30\uCD08 \uC7A5\uBC95. \uAC00\uBCCD\uAC8C \uB2FF\uC544\uB3C4 \uBA40\uB9AC \uBBFC\uB2E4.",
        school: "fist",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "yugeol-gwon", minSeong: 3 }]
      },
      {
        id: "gaebang-tagu-jang",
        name: "\uD0C0\uAD6C\uC7A5",
        hanjaName: "\u6253\u72D7\u638C",
        description: "\uC0AC\uB098\uC6B4 \uB4E4\uAC1C\uB97C \uB9E8\uC190\uC73C\uB85C \uCAD3\uB358 \uAC70\uC9C0\uB4E4\uC758 \uC7A5\uBC95. \uAE09\uC18C\uB9CC \uACE8\uB77C \uD6C4\uB824\uCE5C\uB2E4.",
        school: "fist",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "gaebang-geolgae-su", minSeong: 3 }]
      },
      {
        id: "gaebang-gwangpung-jang",
        name: "\uAD11\uD48D\uC7A5",
        hanjaName: "\u72C2\u98A8\u638C",
        description: "\uBBF8\uCE5C\uBC14\uB78C\uCC98\uB7FC \uC274 \uC0C8 \uC5C6\uC774 \uBAB0\uC544\uCE58\uB294 \uAC1C\uBC29\uC758 \uC5F0\uD658 \uC7A5\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "gaebang-pungrae-jang", minSeong: 3 }]
      },
      {
        id: "chwi-gwon",
        name: "\uCDE8\uAD8C",
        hanjaName: "\u9189\u62F3",
        description: "\uCDE8\uD55C \uBAB8\uC9D3\uC5D0 \uC0B4\uC218\uB97C \uC228\uAE34 \uAC70\uC9C0\uB4E4\uC758 \uAD8C\uBC95. \uC5B4\uB514\uB85C \uC62C\uC9C0 \uBAA8\uB978\uB2E4.",
        school: "fist",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "yugeol-gwon", minSeong: 3 }]
      },
      {
        id: "gaebang-chwiseon-jang",
        name: "\uCDE8\uC120\uC7A5",
        hanjaName: "\u9189\u4ED9\u638C",
        description: "\uC220\uC5D0 \uCDE8\uD55C \uC2E0\uC120\uC774 \uC190\uC744 \uB0B4\uC813\uB4EF \uD5C8\uD5C8\uB85C\uC6B4 \uC7A5\uBC95. \uBE48\uD2C8\uCC98\uB7FC \uBCF4\uC774\uB294 \uACF3\uC774 \uBAA8\uB450 \uC0B4\uC218\uB2E4.",
        school: "fist",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "chwi-gwon", minSeong: 3 }]
      },
      {
        id: "gaebang-jamryong-gwon",
        name: "\uC7A0\uB8E1\uAD8C",
        hanjaName: "\u6F5B\u9F8D\u62F3",
        description: "\uBB3C\uBC11\uC5D0 \uC5CE\uB4DC\uB9B0 \uC6A9\uCC98\uB7FC \uD798\uC744 \uAC10\uCD94\uC5C8\uB2E4\uAC00 \uD55C \uD638\uD761\uC5D0 \uD130\uB728\uB9AC\uB294 \uAD8C.",
        school: "fist",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "gaebang-yurang-gwon", minSeong: 4 }]
      },
      {
        id: "gaebang-pungun-geoljang",
        name: "\uD48D\uC6B4\uAC78\uC7A5",
        hanjaName: "\u98A8\u96F2\u4E5E\u638C",
        description: "\uBC14\uB78C\uACFC \uAD6C\uB984\uC744 \uD568\uAED8 \uBD80\uB9AC\uB294 \uAC1C\uBC29 \uC0C1\uC2B9 \uC7A5\uBC95. \uAC70\uC9C0 \uC190\uC5D0\uC11C \uD48D\uC6B4\uC774 \uC778\uB2E4.",
        school: "fist",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [
          { artId: "gaebang-tagu-jang", minSeong: 5 },
          { artId: "gaebang-gwangpung-jang", minSeong: 4 }
        ]
      },
      {
        id: "gaebang-baekgyeol-sinjang",
        name: "\uBC31\uACB0\uC2E0\uC7A5",
        hanjaName: "\u767E\u7D50\u795E\u638C",
        description: "\uBC31 \uBC88 \uAE30\uC6B4 \uB204\uB354\uAE30\uCC98\uB7FC \uC774\uC5B4 \uBD99\uC778 \uBC31 \uAC08\uB798 \uC7A5\uC138 \u2014 \uB04A\uAE34 \uB4EF \uB2E4\uC2DC \uC774\uC5B4\uC9C4\uB2E4.",
        school: "fist",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "gaebang-gwangpung-jang", minSeong: 5 }]
      },
      {
        id: "gangnyong-gwon",
        name: "\uAC15\uB8E1\uAD8C",
        hanjaName: "\u964D\u9F8D\u62F3",
        description: "\uC6A9\uC744 \uB5A8\uC5B4\uB728\uB9B0\uB2E4\uB294 \uAC1C\uBC29 \uC7A5\uAD8C\uC758 \uC904\uAE30. \uD56D\uB8E1\uC758 \uBB38\uD131.",
        school: "fist",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "yugeol-gwon", minSeong: 5 }]
      },
      {
        id: "gaebang-chwiri-geongon-jang",
        name: "\uCDE8\uB9AC\uAC74\uACE4\uC7A5",
        hanjaName: "\u9189\u88CF\u4E7E\u5764\u638C",
        description: "\uCDE8\uC911\uC5D0 \uD558\uB298\uACFC \uB545\uC744 \uB4A4\uC9D1\uB294\uB2E4 \u2014 \uCDE8\uD55C \uAC78\uC74C\uACFC \uC7A5\uBC95\uC774 \uD558\uB098\uB85C \uB179\uC740 \uAC1C\uBC29 \uBE44\uC804.",
        school: "fist",
        grade: "grandmaster",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [
          { artId: "gaebang-chwiseon-jang", minSeong: 6 },
          { artId: "chwipalseon-bo", minSeong: 5 }
        ]
      },
      {
        id: "hangnyong-sippal-jang",
        name: "\uD56D\uB8E1\uC2ED\uD314\uC7A5",
        hanjaName: "\u4EA2\u9F8D\u5341\u516B\u638C",
        description: "\uC5F4\uC5EC\uB35F \uB9C8\uB9AC \uC6A9\uC774 \uCC28\uB840\uB85C \uB0B4\uB824\uCE58\uB294 \uAC1C\uBC29 \uCD5C\uACE0 \uC7A5\uBC95. \uAC15\uD568\uC758 \uB300\uBA85\uC0AC.",
        school: "fist",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [
          { artId: "gangnyong-gwon", minSeong: 6 },
          { artId: "chwipalseon-bo", minSeong: 4 }
        ]
      },
      // ═══ 보법 (6) — 유랑보 뿌리 → 답풍·천리 → 추풍 / 취팔선보 → 취선신법 ═══════
      {
        id: "gaebang-yurang-bo",
        name: "\uC720\uB791\uBCF4",
        hanjaName: "\u6D41\u6D6A\u6B65",
        description: "\uCC9C\uD558\uB97C \uC9D1 \uC0BC\uC544 \uB5A0\uB3C4\uB294 \uAC70\uC9C0\uC758 \uAC78\uC74C. \uC5B4\uB514\uC11C\uB4E0 \uC9C0\uCE58\uC9C0 \uC54A\uB294\uB2E4.",
        school: "lightness",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "gaebang-dappung-bo",
        name: "\uB2F5\uD48D\uBCF4",
        hanjaName: "\u8E0F\u98A8\u6B65",
        description: "\uBC14\uB78C\uC744 \uBC1F\uACE0 \uBBF8\uB044\uB7EC\uC9C0\uB4EF \uB098\uC544\uAC00\uB294 \uAC1C\uBC29\uC758 \uBCF4\uBC95.",
        school: "lightness",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "gaebang-yurang-bo", minSeong: 3 }]
      },
      {
        id: "gaebang-cheonri-haeng",
        name: "\uCC9C\uB9AC\uD589",
        hanjaName: "\u5343\u91CC\u884C",
        description: "\uD558\uB8E8\uC5D0 \uCC9C \uB9AC\uB97C \uAC04\uB2E4\uB294 \uAC1C\uBC29\uC758 \uC7A5\uAC70\uB9AC \uACBD\uACF5. \uC18C\uC2DD\uC740 \uAC70\uC9C0\uBCF4\uB2E4 \uBE60\uB97C \uC218 \uC5C6\uB2E4.",
        school: "lightness",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "gaebang-yurang-bo", minSeong: 4 }]
      },
      {
        id: "chwipalseon-bo",
        name: "\uCDE8\uD314\uC120\uBCF4",
        hanjaName: "\u9189\u516B\u4ED9\u6B65",
        description: "\uCDE8\uD55C \uB4EF \uBE44\uD2C0\uAC70\uB9AC\uB098 \uACB0\uCF54 \uC7A1\uD788\uC9C0 \uC54A\uB294 \uAC1C\uBC29\uC758 \uBCF4\uBC95.",
        school: "lightness",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "gaebang-chupung-sinbeop",
        name: "\uCD94\uD48D\uC2E0\uBC95",
        hanjaName: "\u8FFD\u98A8\u8EAB\u6CD5",
        description: "\uB2EC\uC544\uB098\uB294 \uBC14\uB78C\uB9C8\uC800 \uB530\uB77C\uC7A1\uB294 \uAC1C\uBC29 \uC0C1\uC2B9 \uC2E0\uBC95.",
        school: "lightness",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [
          { artId: "gaebang-dappung-bo", minSeong: 5 },
          { artId: "gaebang-cheonri-haeng", minSeong: 4 }
        ]
      },
      {
        id: "gaebang-chwiseon-sinbeop",
        name: "\uCDE8\uC120\uC2E0\uBC95",
        hanjaName: "\u9189\u4ED9\u8EAB\u6CD5",
        description: "\uBE44\uD2C0\uAC70\uB9BC\uC774 \uC544\uC608 \uD615(\u5F62)\uC744 \uC783\uC5C8\uB2E4 \u2014 \uCDE8\uD314\uC120\uBCF4\uAC00 \uBB34\uB974\uC775\uC740 \uB05D\uC758 \uC2E0\uBC95.",
        school: "lightness",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "chwipalseon-bo", minSeong: 5 }]
      },
      // ═══ 심법 (6) — 풍찬심법 뿌리 → 풍로·의걸 → 백천귀해 → 항룡신공 ═══════════
      {
        id: "gaebang-pungchan-simbeop",
        name: "\uD48D\uCC2C\uC2EC\uBC95",
        hanjaName: "\u98A8\u9910\u5FC3\u6CD5",
        description: "\uBC14\uB78C\uC744 \uBA39\uACE0 \uC774\uC2AC\uC744 \uB36E\uACE0 \uC790\uB294 \uAC70\uC9C0\uC758 \uD638\uD761\uBC95. \uAC70\uCE5C \uC7A0\uC790\uB9AC\uAC00 \uACE7 \uC218\uB828\uC774\uB2E4.",
        school: "qigong",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest"
      },
      {
        id: "gaebang-ilbal-simgong",
        name: "\uC77C\uBC1C\uC2EC\uACF5",
        hanjaName: "\u4E00\u9262\u5FC3\u529F",
        description: "\uD55C \uADF8\uB987 \uBC25\uC5D0 \uC871\uD558\uB294 \uB9C8\uC74C\uC73C\uB85C \uAE30\uB97C \uACE0\uB974\uB294 \uAC1C\uBC29\uC758 \uC2EC\uACF5. \uBE44\uC6B8\uC218\uB85D \uAE4A\uC5B4\uC9C4\uB2E4.",
        school: "qigong",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "gaebang-pungchan-simbeop", minSeong: 2 }]
      },
      {
        id: "gaebang-pungno-jingi",
        name: "\uD48D\uB85C\uC9C4\uAE30",
        hanjaName: "\u98A8\u9732\u771E\u6C23",
        description: "\uC0C8\uBCBD\uBC14\uB78C\uACFC \uCC2C \uC774\uC2AC\uC744 \uACAC\uB518 \uBAB8\uC5D0\uB9CC \uAE43\uB4DC\uB294 \uC9C8\uAE34 \uC9C4\uAE30.",
        school: "qigong",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "gaebang-pungchan-simbeop", minSeong: 4 }]
      },
      {
        id: "gaebang-uigeol-simbeop",
        name: "\uC758\uAC78\uC2EC\uBC95",
        hanjaName: "\u7FA9\u4E5E\u5FC3\u6CD5",
        description: "\uBE4C\uC5B4\uBA39\uC5B4\uB3C4 \uC758(\u7FA9)\uB294 \uBE4C\uC9C0 \uC54A\uB294\uB2E4 \u2014 \uD611\uAE30\uB97C \uB0B4\uB825\uC73C\uB85C \uBCBC\uB9AC\uB294 \uAC1C\uBC29\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "gaebang-ilbal-simgong", minSeong: 3 }]
      },
      {
        id: "gaebang-baekcheon-gwihae-gong",
        name: "\uBC31\uCC9C\uADC0\uD574\uACF5",
        hanjaName: "\u767E\u5DDD\u6B78\u6D77\u529F",
        description: "\uBC31 \uAC08\uB798 \uAC15\uBB3C\uC774 \uBC14\uB2E4\uB85C \uBAA8\uC774\uB4EF \uD769\uC5B4\uC9C4 \uAE30\uB97C \uD55C \uB2E8\uC804\uC5D0 \uAC70\uB450\uB294 \uC0C1\uC2B9 \uC2EC\uACF5.",
        school: "qigong",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "gaebang-pungno-jingi", minSeong: 5 }]
      },
      {
        id: "gaebang-hangnyong-singong",
        name: "\uD56D\uB8E1\uC2E0\uACF5",
        hanjaName: "\u4EA2\u9F8D\u795E\u529F",
        description: "\uD56D\uB8E1\uC758 \uC7A5\uC138\uB97C \uBC1B\uCE58\uB294 \uAC1C\uBC29 \uC804\uC2B9\uC758 \uC2E0\uACF5. \uAC70\uC9C0\uC758 \uB2E8\uC804\uC5D0 \uC6A9\uC774 \uC7A0\uAE34\uB2E4.",
        school: "qigong",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [
          { artId: "gaebang-baekcheon-gwihae-gong", minSeong: 6 },
          { artId: "gaebang-uigeol-simbeop", minSeong: 5 }
        ]
      },
      // ═══ 외공 (4) — 마의공 뿌리 → 한서불침 → 풍상철골 / 철각 ═══════════════════
      {
        id: "gaebang-maui-gong",
        name: "\uB9C8\uC758\uACF5",
        hanjaName: "\u9EBB\u8863\u529F",
        description: "\uC0BC\uBCA0 \uB204\uB354\uAE30 \uD55C \uBC8C\uB85C \uD55C\uACA8\uC6B8\uC744 \uB098\uB294 \uAC70\uC9C0\uC758 \uAE30\uCD08 \uC678\uACF5. \uC0B4\uAC17\uBD80\uD130 \uB2E8\uB828\uD55C\uB2E4.",
        school: "external",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest"
      },
      {
        id: "gaebang-hanseo-bulchim-gong",
        name: "\uD55C\uC11C\uBD88\uCE68\uACF5",
        hanjaName: "\u5BD2\u6691\u4E0D\u4FB5\u529F",
        description: "\uCD94\uC704\uB3C4 \uB354\uC704\uB3C4 \uBAB8\uC5D0 \uB4E4\uC774\uC9C0 \uC54A\uB294\uB2E4 \u2014 \uD55C\uB370\uC0B4\uC774\uB85C \uB2E4\uC838\uC9C4 \uAC1C\uBC29\uC758 \uC678\uACF5.",
        school: "external",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "gaebang-maui-gong", minSeong: 4 }]
      },
      {
        id: "gaebang-pungsang-cheolgol-gong",
        name: "\uD48D\uC0C1\uCCA0\uACE8\uACF5",
        hanjaName: "\u98A8\u971C\u9435\u9AA8\u529F",
        description: "\uD48D\uC0C1\uC744 \uB2E4 \uACAA\uC740 \uBF08\uAC00 \uC1E0\uCC98\uB7FC \uAD73\uB294\uB2E4\uB294 \uAC1C\uBC29 \uC0C1\uC2B9 \uC678\uACF5.",
        school: "external",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "gaebang-hanseo-bulchim-gong", minSeong: 5 }]
      },
      {
        id: "gaebang-cheolgak-gong",
        name: "\uB3D9\uAC01\uACF5",
        hanjaName: "\u9285\u811A\u529F",
        description: "\uB9E8\uBC1C\uB85C \uCC9C\uD558\uB97C \uB514\uB518 \uB2E4\uB9AC\uAC00 \uBB34\uC1E0\uAC00 \uB41C\uB2E4 \u2014 \uCC28\uACE0 \uBC1F\uB294 \uAC83\uC774 \uBAA8\uB450 \uBCD1\uAE30\uB2E4.",
        school: "external",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "gaebang",
        acquisition: "quest",
        prerequisites: [{ artId: "gaebang-hanseo-bulchim-gong", minSeong: 5 }]
      }
    ];
  }
});

// src/data/martialArts/catalog/ami.ts
var AMI_ARTS;
var init_ami = __esm({
  "src/data/martialArts/catalog/ami.ts"() {
    "use strict";
    AMI_ARTS = [
      // ═══ 검법 (10) — 기초검 뿌리 → 연화·불광·복호 갈래 → 만불조종 합류 ═════════
      {
        id: "ami-gicho-sword",
        name: "\uC544\uBBF8\uAE30\uCD08\uAC80",
        hanjaName: "\u5CE8\u5D4B\u57FA\u790E\u528D",
        description: "\uC544\uBBF8 \uC785\uBB38\uC81C\uC790\uC758 \uAC80. \uBD80\uB4DC\uB7EC\uC6B4 \uACB0 \uC18D\uC5D0 \uB9E4\uC11C\uC6C0\uC744 \uC228\uAE34\uB2E4.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest"
      },
      {
        id: "ami-cheongnyeon-sword",
        name: "\uCCAD\uB828\uAC80",
        hanjaName: "\u9751\u84EE\u528D",
        description: "\uD53C\uAE30 \uC804\uC758 \uD478\uB978 \uC5F0\uAF43\uCC98\uB7FC \uB2E8\uC815\uD55C \uAC80. \uBCA0\uAE30\uBCF4\uB2E4 \uAC70\uB450\uB294 \uBC95\uC744 \uBA3C\uC800 \uC775\uD78C\uB2E4.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [{ artId: "ami-gicho-sword", minSeong: 2 }]
      },
      {
        id: "ami-yeonhwa-sword",
        name: "\uC5F0\uD654\uAC80\uBC95",
        hanjaName: "\u84EE\u82B1\u528D\u6CD5",
        description: "\uC5F0\uAF43\uC78E\uC774 \uD55C \uACB9\uC529 \uBC8C\uC5B4\uC9C0\uB4EF \uAC80\uC138\uAC00 \uACB9\uACB9\uC774 \uD53C\uC5B4\uB098\uB294 \uC544\uBBF8 \uC911\uAE09 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [{ artId: "ami-gicho-sword", minSeong: 3 }]
      },
      {
        id: "ami-bulgwang-sword",
        name: "\uBD88\uAD11\uAC80",
        hanjaName: "\u4F5B\u5149\u528D",
        description: "\uAC80 \uB05D\uC5D0 \uBD80\uCC98\uC758 \uBE5B\uC774 \uC5B4\uB9B0\uB2E4\uB294 \uC544\uBBF8\uC758 \uAC80. \uBCA0\uC5B4\uB3C4 \uC6D0\uD55C\uC744 \uB0A8\uAE30\uC9C0 \uC54A\uB294\uB2E4.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [{ artId: "ami-cheongnyeon-sword", minSeong: 3 }]
      },
      {
        id: "ami-bokho-sword",
        name: "\uBCF5\uD638\uAC80",
        hanjaName: "\u4F0F\u864E\u528D",
        description: "\uD638\uB791\uC774\uB97C \uB204\uB974\uB4EF \uC704\uC5D0\uC11C \uB0B4\uB9AC \uC81C\uC555\uD558\uB294 \uC544\uBBF8\uC758 \uAC15\uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [{ artId: "ami-gicho-sword", minSeong: 4 }]
      },
      {
        id: "ami-geumjeong-sword",
        name: "\uAE08\uC815\uAC80",
        hanjaName: "\u91D1\u9802\u528D",
        description: "\uAE08\uC815\uBD09 \uCCAB \uD587\uC0B4\uCC98\uB7FC \uACE7\uAC8C \uB0B4\uB9AC\uAF42\uD788\uB294 \uC544\uBBF8\uC758 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [{ artId: "ami-yeonhwa-sword", minSeong: 3 }]
      },
      {
        id: "nanpipung-sword",
        name: "\uB09C\uD53C\uD48D\uAC80\uBC95",
        hanjaName: "\u4E82\u62AB\u98A8\u528D\u6CD5",
        description: "\uD769\uB0A0\uB9AC\uB294 \uBC14\uB78C\uCC98\uB7FC \uD45C\uD640\uD55C \uC544\uBBF8 \uC0C1\uC2B9 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [{ artId: "ami-gicho-sword", minSeong: 5 }]
      },
      {
        id: "ami-gupum-yeonhwa-sword",
        name: "\uAD6C\uD488\uC5F0\uD654\uAC80",
        hanjaName: "\u4E5D\u54C1\u84EE\u82B1\u528D",
        description: "\uC544\uD649 \uD488\uACC4\uC758 \uC5F0\uAF43\uC774 \uCC28\uB840\uB85C \uD53C\uACE0 \uC9C0\uB294 \uC544\uBBF8 \uC0C1\uC2B9 \uAC80. \uB9C8\uC9C0\uB9C9 \uC78E\uC774 \uC0B4\uC218\uB2E4.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [{ artId: "ami-yeonhwa-sword", minSeong: 5 }]
      },
      {
        id: "ami-bulgwang-bojo-sword",
        name: "\uBD88\uAD11\uBCF4\uC870\uAC80",
        hanjaName: "\u4F5B\u5149\u666E\u7167\u528D",
        description: "\uBD80\uCC98\uC758 \uBE5B\uC774 \uB450\uB8E8 \uBE44\uCE58\uB4EF \uC0AC\uBC29\uC744 \uD55C \uAC80\uC138\uB85C \uB36E\uB294 \uC544\uBBF8 \uC0C1\uC2B9 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [
          { artId: "ami-bulgwang-sword", minSeong: 5 },
          { artId: "ami-bokho-sword", minSeong: 4 }
        ]
      },
      {
        id: "ami-manbul-jojong-sword",
        name: "\uB9CC\uBD88\uC870\uC885\uAC80",
        hanjaName: "\u842C\u4F5B\u671D\u5B97\u528D",
        description: "\uB9CC \uBD80\uCC98\uAC00 \uD55C \uACF3\uC744 \uD5A5\uD558\uB4EF \uBAA8\uB4E0 \uAC80\uACB0\uC774 \uD558\uB098\uB85C \uBAA8\uC774\uB294 \uC544\uBBF8 \uAC80\uD559\uC758 \uC815\uC810.",
        school: "sword",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [
          { artId: "ami-gupum-yeonhwa-sword", minSeong: 6 },
          { artId: "ami-bulgwang-bojo-sword", minSeong: 5 }
        ]
      },
      // ═══ 권·장법 (8) — 합십수 뿌리 / 십이장 뿌리 → 천엽연화·복호 → 항마 합류 ═══
      {
        id: "ami-hapsip-su",
        name: "\uD569\uC2ED\uC218",
        hanjaName: "\u5408\u5341\u624B",
        description: "\uD569\uC7A5\uD55C \uC190\uC774 \uADF8\uB300\uB85C \uBB34\uAE30\uAC00 \uB418\uB294 \uC544\uBBF8\uC758 \uC785\uBB38 \uC218\uBC95. \uC608(\u79AE)\uAC00 \uACE7 \uBC29\uC5B4\uB2E4.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest"
      },
      {
        id: "ami-sobokho-gwon",
        name: "\uC18C\uBCF5\uD638\uAD8C",
        hanjaName: "\u5C0F\u4F0F\u864E\u62F3",
        description: "\uBCF5\uD638\uAE08\uAC15\uAD8C\uC73C\uB85C \uAC00\uB294 \uCCAB \uACC4\uB2E8. \uC791\uC740 \uD638\uB791\uC774\uBD80\uD130 \uC5CE\uB4DC\uB9AC\uAC8C \uD55C\uB2E4.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [{ artId: "ami-hapsip-su", minSeong: 2 }]
      },
      {
        id: "ami-sibi-jang",
        name: "\uC544\uBBF8\uC2ED\uC774\uC7A5",
        hanjaName: "\u5CE8\u5D4B\u5341\u4E8C\u638C",
        description: "\uCC9C\uC9C0\uD48D\uC6B4\uC744 \uB2F4\uC740 \uC5F4\uB450 \uAC08\uB798 \uC7A5\uBC95. \uC544\uBBF8 \uBB34\uD559\uC758 \uD1A0\uB300.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest"
      },
      {
        id: "ami-yeonhwa-jang",
        name: "\uC5F0\uD654\uC7A5",
        hanjaName: "\u84EE\u82B1\u638C",
        description: "\uC190\uBC14\uB2E5\uC5D0 \uC5F0\uAF43\uC774 \uD53C\uB4EF \uBD80\uB4DC\uB7FD\uAC8C \uAC10\uC2F8 \uCE58\uB294 \uC544\uBBF8\uC758 \uC7A5\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [{ artId: "ami-hapsip-su", minSeong: 3 }]
      },
      {
        id: "ami-geumjeong-jang",
        name: "\uAE08\uC815\uC7A5",
        hanjaName: "\u91D1\u9802\u638C",
        description: "\uAE08\uC815\uBD09\uC758 \uBB34\uAC8C\uB97C \uC190\uBC14\uB2E5\uC5D0 \uC2E3\uB294 \uC544\uBBF8\uC758 \uAC15\uC7A5(\u525B\u638C).",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [{ artId: "ami-sobokho-gwon", minSeong: 3 }]
      },
      {
        id: "bokho-geumgang-gwon",
        name: "\uBCF5\uD638\uAE08\uAC15\uAD8C",
        hanjaName: "\u4F0F\u864E\u91D1\u525B\u62F3",
        description: "\uD638\uB791\uC774\uB97C \uC5CE\uB4DC\uB9AC\uAC8C \uD55C\uB2E4\uB294 \uC544\uBBF8\uC758 \uAC15\uB9F9\uD55C \uAD8C\uBC95.",
        school: "fist",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [{ artId: "ami-sibi-jang", minSeong: 5 }]
      },
      {
        id: "ami-cheonyeop-yeonhwa-jang",
        name: "\uCC9C\uC5FD\uC5F0\uD654\uC7A5",
        hanjaName: "\u5343\u8449\u84EE\u82B1\u638C",
        description: "\uCC9C \uACB9 \uC5F0\uAF43\uC78E\uC774 \uD55C\uAEBC\uBC88\uC5D0 \uB5A8\uC5B4\uC9C0\uB4EF \uC7A5\uC601(\u638C\u5F71)\uC774 \uACB9\uACB9\uC774 \uC3DF\uC544\uC9C0\uB294 \uC0C1\uC2B9 \uC7A5\uBC95.",
        school: "fist",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [
          { artId: "ami-yeonhwa-jang", minSeong: 5 },
          { artId: "ami-sibi-jang", minSeong: 4 }
        ]
      },
      {
        id: "ami-hangma-singwon",
        name: "\uBD88\uAD11\uC2E0\uAD8C",
        hanjaName: "\u4F5B\u5149\u795E\u62F3",
        description: "\uB9C8(\u9B54)\uB97C \uD56D\uBCF5\uC2DC\uD0A4\uB294 \uBD80\uCC98\uC758 \uC8FC\uBA39 \u2014 \uC544\uBBF8 \uAD8C\uC7A5\uC758 \uB450 \uC904\uAE30\uAC00 \uB9CC\uB098\uB294 \uC815\uC810.",
        school: "fist",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [
          { artId: "bokho-geumgang-gwon", minSeong: 6 },
          { artId: "ami-cheonyeop-yeonhwa-jang", minSeong: 5 }
        ]
      },
      // ═══ 심법 (6) — 아미심법 뿌리 → 불광·연화심결 → 금정기공 → 보리·금정신공 ═══
      {
        id: "ami-simbeop",
        name: "\uC544\uBBF8\uC2EC\uBC95",
        hanjaName: "\u5CE8\u5D4B\u5FC3\u6CD5",
        description: "\uC544\uBBF8 \uC785\uBB38\uC81C\uC790\uC758 \uAE30\uCD08 \uC2EC\uBC95. \uC5FC\uBD88\uCC98\uB7FC \uACE0\uB978 \uD638\uD761\uC774 \uB2E8\uC804\uC744 \uB2E4\uC9C4\uB2E4.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest"
      },
      {
        id: "ami-yeonhwa-simgyeol",
        name: "\uC5F0\uD654\uC2EC\uACB0",
        hanjaName: "\u84EE\u82B1\u5FC3\u8A23",
        description: "\uC9C4\uD759\uC5D0 \uBB3C\uB4E4\uC9C0 \uC54A\uB294 \uC5F0\uAF43\uC758 \uB9C8\uC74C\uC744 \uC0C8\uAE30\uB294 \uAD6C\uACB0. \uAE30\uAC00 \uB9D1\uACE0 \uC7A1\uB150\uC774 \uC801\uB2E4.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [{ artId: "ami-simbeop", minSeong: 2 }]
      },
      {
        id: "ami-bulgwang-simbeop",
        name: "\uBD88\uAD11\uC2EC\uBC95",
        hanjaName: "\u4F5B\u5149\u5FC3\u6CD5",
        description: "\uB2E8\uC804\uC5D0 \uB4F1\uBD88 \uD558\uB098\uB97C \uCF1C\uB4EF \uB530\uB73B\uD55C \uAE30\uC6B4\uC744 \uAE30\uB974\uB294 \uC544\uBBF8 \uC911\uAE09 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [{ artId: "ami-simbeop", minSeong: 4 }]
      },
      {
        id: "ami-geumjeong-gigong",
        name: "\uAE08\uC815\uAE30\uACF5",
        hanjaName: "\u91D1\u9802\u6C23\u529F",
        description: "\uAE08\uC815\uBD09 \uC77C\uCD9C\uC758 \uAE30\uC6B4\uC744 \uB2E8\uC804\uC5D0 \uAC70\uB450\uB294 \uC544\uBBF8 \uC0C1\uC2B9 \uAE30\uACF5. \uAE08\uC815\uC2E0\uACF5\uC758 \uBB38\uD131.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [{ artId: "ami-bulgwang-simbeop", minSeong: 5 }]
      },
      {
        id: "ami-bori-singong",
        name: "\uBCF4\uB9AC\uC2E0\uACF5",
        hanjaName: "\u83E9\u63D0\u795E\u529F",
        description: "\uBCF4\uB9AC\uC218 \uC544\uB798\uC758 \uAE68\uB2EC\uC74C\uC744 \uC887\uB294 \uC544\uBBF8 \uBE44\uC804 \uC2E0\uACF5. \uB9C8\uC74C\uC774 \uB9D1\uC544\uC9C8\uC218\uB85D \uAE30\uAC00 \uAE4A\uC5B4\uC9C4\uB2E4.",
        school: "qigong",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [
          { artId: "ami-geumjeong-gigong", minSeong: 6 },
          { artId: "ami-yeonhwa-simgyeol", minSeong: 5 }
        ]
      },
      {
        id: "geumjeong-singong",
        name: "\uAE08\uC815\uC2E0\uACF5",
        hanjaName: "\u91D1\u9802\u795E\u529F",
        description: "\uC544\uBBF8 \uAE08\uC815\uBD09\uC758 \uD587\uC0B4\uC744 \uB2EE\uC740 \uC7A5\uBB38 \uC804\uC2B9 \uC2EC\uBC95.",
        school: "qigong",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [{ artId: "ami-sibi-jang", minSeong: 6 }]
      },
      // ═══ 보법 (4) — 금련보 → 표연보 / 비상련화 → 능운연화보 합류 ═══════════════
      {
        id: "ami-geumnyeon-bo",
        name: "\uAE08\uB828\uBCF4",
        hanjaName: "\u91D1\u84EE\u6B65",
        description: "\uAC78\uC74C\uB9C8\uB2E4 \uAE08\uBE5B \uC5F0\uAF43\uC774 \uD540\uB2E4\uB294 \uC544\uBBF8\uC758 \uC785\uBB38 \uBCF4\uBC95. \uC18C\uB9AC\uB3C4 \uC790\uAD6D\uB3C4 \uAC00\uBCCD\uB2E4.",
        school: "lightness",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "ami-pyoyeon-bo",
        name: "\uD45C\uC5F0\uBCF4",
        hanjaName: "\u98C4\u7136\u6B65",
        description: "\uBC14\uB78C\uC5D0 \uC2E4\uB9B0 \uAF43\uC78E\uCC98\uB7FC \uD45C\uC5F0\uD788 \uC790\uB9AC\uB97C \uC62E\uAE30\uB294 \uC544\uBBF8\uC758 \uBCF4\uBC95.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [{ artId: "ami-geumnyeon-bo", minSeong: 3 }]
      },
      {
        id: "bisang-ryeonhwa",
        name: "\uBE44\uC0C1\uB828\uD654",
        hanjaName: "\u98DB\u7FD4\u84EE\u82B1",
        description: "\uC5F0\uAF43\uC78E\uC774 \uB0A0\uC544\uC624\uB974\uB4EF \uAC00\uBCCD\uAC8C \uC19F\uB294 \uC544\uBBF8\uC758 \uACBD\uACF5.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "ami-neungun-yeonhwa-bo",
        name: "\uB2A5\uC6B4\uC5F0\uD654\uBCF4",
        hanjaName: "\u51CC\u96F2\u84EE\u82B1\u6B65",
        description: "\uAD6C\uB984\uC744 \uB2A5\uBA78\uD558\uBA70 \uD53C\uB294 \uC5F0\uAF43 \u2014 \uD5C8\uACF5\uC744 \uC5F0\uC78E \uC0BC\uC544 \uB51B\uB294 \uC544\uBBF8 \uACBD\uACF5\uC758 \uC815\uC218.",
        school: "lightness",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [
          { artId: "ami-pyoyeon-bo", minSeong: 5 },
          { artId: "bisang-ryeonhwa", minSeong: 4 }
        ]
      },
      // ═══ 외공 (2) — 반야호체공 → 연화금강체 ═══════════════════════════════════
      {
        id: "ami-banya-hoche-gong",
        name: "\uBC18\uC57C\uD638\uCCB4\uACF5",
        hanjaName: "\u822C\u82E5\u8B77\u9AD4\u529F",
        description: "\uBC18\uC57C\uC758 \uC9C0\uD61C\uB85C \uBAB8\uC744 \uC9C0\uD0A8\uB2E4\uB294 \uC544\uBBF8\uC758 \uC678\uACF5. \uB9C8\uC74C\uC774 \uB2E8\uB2E8\uD574\uC57C \uBAB8\uC774 \uB2E8\uB2E8\uD558\uB2E4.",
        school: "external",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [{ artId: "ami-hapsip-su", minSeong: 3 }]
      },
      {
        id: "ami-yeonhwa-geumgang-che",
        name: "\uC5F0\uD654\uAE08\uAC15\uCCB4",
        hanjaName: "\u84EE\u82B1\u91D1\u525B\u9AD4",
        description: "\uAC89\uC740 \uC5F0\uAF43\uCC98\uB7FC \uBD80\uB4DC\uB7FD\uACE0 \uC18D\uC740 \uAE08\uAC15\uCC98\uB7FC \uB2E8\uB2E8\uD55C \uC544\uBBF8 \uC678\uACF5\uC758 \uC815\uC810.",
        school: "external",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "ami",
        acquisition: "quest",
        prerequisites: [{ artId: "ami-banya-hoche-gong", minSeong: 5 }]
      }
    ];
  }
});

// src/data/martialArts/catalog/jeomchang.ts
var JEOMCHANG_ARTS;
var init_jeomchang = __esm({
  "src/data/martialArts/catalog/jeomchang.ts"() {
    "use strict";
    JEOMCHANG_ARTS = [
      // ═══ 검법 (16) — 기초검 뿌리 → 찌르기·해·새벽 세 갈래 → 관일·사일 정점 ═════
      {
        id: "jeomchang-gicho-sword",
        name: "\uC810\uCC3D\uAE30\uCD08\uAC80",
        hanjaName: "\u9EDE\u84BC\u57FA\u790E\u528D",
        description: "\uC810\uCC3D\uC758 \uC785\uBB38 \uAC80. \uCC0C\uB974\uAE30 \uD558\uB098\uB97C \uCC9C \uBC88 \uB9CC \uBC88 \uB2E4\uB4EC\uB294\uB2E4.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest"
      },
      {
        id: "jeomchang-iljeom-sword",
        name: "\uC77C\uC810\uAC80",
        hanjaName: "\u4E00\u9EDE\u528D",
        description: "\uCC9C \uCD08\uC2DD\uC774 \uACB0\uAD6D \uD55C \uC810\uC73C\uB85C \uB3CC\uC544\uC628\uB2E4 \u2014 \uC810 \uD558\uB098\uB97C \uAFF0\uB294 \uC810\uCC3D\uC758 \uAE30\uCD08 \uC790\uAC80(\u523A\u528D).",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomchang-gicho-sword", minSeong: 2 }]
      },
      {
        id: "jeomchang-seogwang-sword",
        name: "\uC11C\uAD11\uAC80",
        hanjaName: "\u66D9\u5149\u528D",
        description: "\uB3D9\uD2B8\uAE30 \uC9C1\uC804\uC758 \uCCAB \uBE5B\uCC98\uB7FC \uBCF4\uC77C \uB4EF \uB9D0 \uB4EF \uC2A4\uBA70\uB4DC\uB294 \uC810\uCC3D\uC758 \uAC80.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomchang-gicho-sword", minSeong: 3 }]
      },
      {
        id: "jeomchang-iljo-sword",
        name: "\uC77C\uC870\uAC80",
        hanjaName: "\u4E00\u689D\u528D",
        description: "\uAC80\uB85C(\u528D\u8DEF)\uAC00 \uC624\uC9C1 \uD55C \uC904\uAE30 \u2014 \uACC1\uAC00\uC9C0\uB97C \uB2E4 \uCCD0\uB0B8 \uC810\uCC3D \uCC0C\uB974\uAE30\uC758 \uBCF8\uB958.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomchang-iljeom-sword", minSeong: 3 }]
      },
      {
        id: "jeomchang-yuseong-sword",
        name: "\uC720\uC131\uAC80",
        hanjaName: "\u6D41\u661F\u528D",
        description: "\uBC24\uD558\uB298\uC744 \uAE0B\uB294 \uBCC4\uB625\uCC98\uB7FC \uD55C \uBC88 \uB5A8\uC5B4\uC9C0\uBA74 \uB3CC\uC774\uD0AC \uC218 \uC5C6\uB294 \uCF8C\uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomchang-iljeom-sword", minSeong: 4 }]
      },
      {
        id: "jeomchang-ugil-sword",
        name: "\uC6B1\uC77C\uAC80",
        hanjaName: "\u65ED\u65E5\u528D",
        description: "\uB5A0\uC624\uB974\uB294 \uC544\uCE68 \uD574\uCC98\uB7FC \uAE30\uC138\uAC00 \uC904\uACE7 \uCC28\uC624\uB974\uB294 \uC810\uCC3D \uC911\uAE09 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomchang-gicho-sword", minSeong: 4 }]
      },
      {
        id: "jeomchang-hyoseong-sword",
        name: "\uD6A8\uC131\uAC80",
        hanjaName: "\u66C9\u661F\u528D",
        description: "\uC0C8\uBCBD\uBCC4 \uD558\uB098\uAC00 \uC5B4\uB460\uC744 \uCC0C\uB974\uB4EF \uACE0\uC694 \uC18D\uC5D0\uC11C \uD55C \uC810\uC744 \uB178\uB9AC\uB294 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomchang-seogwang-sword", minSeong: 3 }]
      },
      {
        id: "jeomchang-cheongnam-sword",
        name: "\uCCAD\uB78C\uAC80",
        hanjaName: "\u9751\u5D50\u528D",
        description: "\uCC3D\uC0B0\uC758 \uD478\uB978 \uC0B0\uC548\uAC1C\uCC98\uB7FC \uC790\uCDE8 \uC5C6\uC774 \uC2A4\uBBF8\uB294 \uC810\uCC3D\uC758 \uBCC0\uAC80(\u8B8A\u528D).",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomchang-gicho-sword", minSeong: 3 }]
      },
      {
        id: "hwaryong-sword",
        name: "\uD654\uB8E1\uAC80",
        hanjaName: "\u706B\u9F8D\u528D",
        description: "\uBD88\uC758 \uC6A9\uC774 \uD718\uB3C4\uB294 \uC810\uCC3D \uC911\uAE09 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomchang-gicho-sword", minSeong: 4 }]
      },
      {
        id: "hoepung-sword",
        name: "\uD68C\uD48D\uAC80",
        hanjaName: "\u56DE\u98A8\u528D",
        description: "\uB418\uB3CC\uC544\uCE58\uB294 \uBC14\uB78C\uCC98\uB7FC \uBCC0\uD654\uBB34\uC30D\uD55C \uC810\uCC3D\uC758 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomchang-gicho-sword", minSeong: 3 }]
      },
      {
        id: "jeomchang-ilseom-sword",
        name: "\uC77C\uC12C\uAC80",
        hanjaName: "\u4E00\u9583\u528D",
        description: "\uBC88\uCA4D, \uD55C \uBC88 \u2014 \uBCF4\uC558\uB2E4\uBA74 \uC774\uBBF8 \uAFF0\uB6AB\uB9B0 \uB4A4\uB2E4. \uC810\uCC3D \uCF8C\uAC80\uC758 \uC0C1\uC2B9 \uACBD\uC9C0.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomchang-iljo-sword", minSeong: 5 }]
      },
      {
        id: "jeomchang-bungwang-sword",
        name: "\uBD84\uAD11\uAC80\uBC95",
        hanjaName: "\u5206\u5149\u528D\u6CD5",
        description: "\uD55C \uC904\uAE30 \uBE5B\uC744 \uC5EC\uB7EC \uAC08\uB798\uB85C \uCABC\uAC1C\uB4EF \uAC80\uC601(\u528D\u5F71)\uC774 \uC0AC\uBC29\uC5D0\uC11C \uAF42\uD788\uB294 \uC810\uCC3D \uC0C1\uC2B9 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [
          { artId: "jeomchang-yuseong-sword", minSeong: 5 },
          { artId: "jeomchang-cheongnam-sword", minSeong: 4 }
        ]
      },
      {
        id: "jeomchang-nagil-sword",
        name: "\uB099\uC77C\uAC80",
        hanjaName: "\u843D\u65E5\u528D",
        description: "\uC9C0\uB294 \uD574\uAC00 \uB9C8\uC9C0\uB9C9\uC73C\uB85C \uD1A0\uD558\uB294 \uBE5B\uCC98\uB7FC \uBB34\uAC81\uACE0 \uBD89\uC740 \uC77C\uACA9\uC758 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomchang-ugil-sword", minSeong: 5 }]
      },
      {
        id: "jeomchang-jangwang-sword",
        name: "\uC794\uAD11\uAC80",
        hanjaName: "\u6B98\u5149\u528D",
        description: "\uAC80\uC740 \uC774\uBBF8 \uC9C0\uB098\uAC14\uB294\uB370 \uBE5B\uB9CC \uB0A8\uC544 \uC788\uB2E4 \u2014 \uC0C8\uBCBD\uBE5B\uACFC \uD68C\uD48D\uC774 \uB9CC\uB09C \uC810\uCC3D\uC758 \uD658\uAC80(\u5E7B\u528D).",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [
          { artId: "jeomchang-hyoseong-sword", minSeong: 5 },
          { artId: "hoepung-sword", minSeong: 4 }
        ]
      },
      {
        id: "jeomchang-gwanil-sword",
        name: "\uAD00\uC77C\uAC80",
        hanjaName: "\u8CAB\u65E5\u528D",
        description: "\uD770 \uBB34\uC9C0\uAC1C\uAC00 \uD574\uB97C \uAFF0\uB6AB\uB294\uB2E4 \u2014 \uC0AC\uC77C(\u5C04\u65E5)\uC5D0 \uC774\uB974\uAE30 \uC804 \uB9C8\uC9C0\uB9C9 \uAD00\uBB38\uC758 \uAC80.",
        school: "sword",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [
          { artId: "jeomchang-bungwang-sword", minSeong: 6 },
          { artId: "jeomchang-ilseom-sword", minSeong: 5 }
        ]
      },
      {
        id: "sail-sword",
        name: "\uC0AC\uC77C\uAC80\uBC95",
        hanjaName: "\u5C04\u65E5\u528D\u6CD5",
        description: "\uD574\uB97C \uC3D8\uC544 \uB5A8\uC5B4\uB728\uB9B0\uB2E4\uB294 \uC810\uCC3D \uC9C4\uC0B0\uC808\uAE30. \uCC9C\uD558\uC5D0\uC11C \uAC00\uC7A5 \uBE60\uB978 \uCC0C\uB974\uAE30.",
        school: "sword",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [
          { artId: "hwaryong-sword", minSeong: 6 },
          { artId: "hoepung-sword", minSeong: 4 }
        ]
      },
      // ═══ 보법 (5) — 창산보 뿌리 → 효행·질풍 → 추광 → 비광 ═════════════════════
      {
        id: "jeomchang-changsan-bo",
        name: "\uCC3D\uC0B0\uBCF4",
        hanjaName: "\u84BC\u5C71\u6B65",
        description: "\uCC3D\uC0B0 \uC5F4\uC544\uD649 \uBD09\uC6B0\uB9AC\uC758 \uBE44\uD0C8\uC744 \uC624\uB974\uB0B4\uB9AC\uBA70 \uB2E4\uC838\uC9C4 \uC810\uCC3D\uC758 \uAE30\uCD08 \uBCF4\uBC95.",
        school: "lightness",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "jeomchang-hyohaeng-bo",
        name: "\uD6A8\uD589\uBCF4",
        hanjaName: "\u66C9\u884C\u6B65",
        description: "\uB3D9\uD2B8\uAE30 \uC804 \uC5B4\uC2A4\uB984\uC744 \uB2EC\uB9AC\uB294 \uAC78\uC74C. \uBE5B\uBCF4\uB2E4 \uBA3C\uC800 \uB2FF\uB294 \uAC83\uC774 \uC810\uCC3D\uC758 \uAE0D\uC9C0\uB2E4.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomchang-changsan-bo", minSeong: 3 }]
      },
      {
        id: "jeomchang-jilpung-bo",
        name: "\uC9C8\uD48D\uBCF4",
        hanjaName: "\u75BE\u98A8\u6B65",
        description: "\uB0B4\uB514\uB518 \uC790\uB9AC\uC5D0 \uBC14\uB78C \uC18C\uB9AC\uB9CC \uB0A8\uB294 \uC810\uCC3D\uC758 \uCF8C\uBCF4. \uAC80\uBCF4\uB2E4 \uBC1C\uC774 \uBA3C\uC800 \uB2FF\uB294\uB2E4.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomchang-changsan-bo", minSeong: 4 }]
      },
      {
        id: "jeomchang-chugwang-sinbeop",
        name: "\uCD94\uAD11\uC2E0\uBC95",
        hanjaName: "\u8FFD\u5149\u8EAB\u6CD5",
        description: "\uB2EC\uC544\uB098\uB294 \uBE5B\uC744 \uB4A4\uCAD3\uB294\uB2E4\uB294 \uC810\uCC3D \uC0C1\uC2B9 \uC2E0\uBC95. \uCF8C\uAC80\uC740 \uCF8C\uBCF4 \uC704\uC5D0\uC11C \uC0B0\uB2E4.",
        school: "lightness",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomchang-hyohaeng-bo", minSeong: 5 }]
      },
      {
        id: "jeomchang-bigwang-sinbeop",
        name: "\uBE44\uAD11\uC2E0\uBC95",
        hanjaName: "\u98DB\u5149\u8EAB\u6CD5",
        description: "\uBAB8\uC774 \uACE7 \uB0A0\uC544\uAC00\uB294 \uBE5B\uC0B4\uC774 \uB41C\uB2E4 \u2014 \uC810\uCC3D \uACBD\uACF5\uC758 \uC815\uC810.",
        school: "lightness",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [
          { artId: "jeomchang-chugwang-sinbeop", minSeong: 6 },
          { artId: "jeomchang-jilpung-bo", minSeong: 5 }
        ]
      },
      // ═══ 심법 (6) — 점창심법 뿌리 → 조양·일륜 → 열양·청천 → 대일신공 ═══════════
      {
        id: "jeomchang-simbeop",
        name: "\uC810\uCC3D\uC2EC\uBC95",
        hanjaName: "\u9EDE\u84BC\u5FC3\u6CD5",
        description: "\uC810\uCC3D \uC785\uBB38\uC81C\uC790\uC758 \uAE30\uCD08 \uC2EC\uBC95. \uB4E4\uC228\uC740 \uC0C8\uBCBD\uCC98\uB7FC \uCC28\uACE0 \uB0A0\uC228\uC740 \uD55C\uB0AE\uCC98\uB7FC \uACE7\uB2E4.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest"
      },
      {
        id: "jeomchang-joyang-gong",
        name: "\uC870\uC591\uACF5",
        hanjaName: "\u671D\u967D\u529F",
        description: "\uC544\uCE68 \uD574\uB97C \uB9C8\uC8FC \uBCF4\uACE0 \uCCAB \uAE30\uC6B4\uC744 \uB4E4\uC774\uCF1C\uB294 \uC810\uCC3D\uC758 \uCC44\uAE30(\u63A1\u6C23) \uACF5\uBD80.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomchang-simbeop", minSeong: 2 }]
      },
      {
        id: "jeomchang-illyun-simbeop",
        name: "\uC77C\uB95C\uC2EC\uBC95",
        hanjaName: "\u65E5\u8F2A\u5FC3\u6CD5",
        description: "\uB2E8\uC804\uC5D0 \uD574 \uBC14\uD034 \uD558\uB098\uB97C \uAD74\uB9AC\uB4EF \uC591\uAE30(\u967D\u6C23)\uB97C \uB465\uAE00\uAC8C \uAE30\uB974\uB294 \uC911\uAE09 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomchang-joyang-gong", minSeong: 3 }]
      },
      {
        id: "jeomchang-yeolyang-singong",
        name: "\uC5F4\uC591\uC2E0\uACF5",
        hanjaName: "\u70C8\u967D\u795E\u529F",
        description: "\uD55C\uB0AE\uC758 \uB664\uC57D\uBCD5\uCC98\uB7FC \uB9F9\uB82C\uD55C \uC591\uAC15 \uC9C4\uAE30\uB97C \uC313\uB294 \uC810\uCC3D \uC0C1\uC2B9 \uC2EC\uBC95.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomchang-illyun-simbeop", minSeong: 5 }]
      },
      {
        id: "jeomchang-cheongcheon-gangki",
        name: "\uCCAD\uCC9C\uAC15\uAE30",
        hanjaName: "\u6674\u5929\u7F61\u6C23",
        description: "\uAD6C\uB984 \uD55C \uC810 \uC5C6\uB294 \uAC20 \uD558\uB298\uC758 \uAE30\uC6B4\uC744 \uB450\uB974\uB294 \uC810\uCC3D\uC758 \uD638\uC2E0\uAC15\uAE30.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [
          { artId: "jeomchang-simbeop", minSeong: 5 },
          { artId: "jeomchang-illyun-simbeop", minSeong: 4 }
        ]
      },
      {
        id: "jeomchang-daeil-singong",
        name: "\uB300\uC77C\uC2E0\uACF5",
        hanjaName: "\u5927\u65E5\u795E\u529F",
        description: "\uD558\uB298 \uD55C\uAC00\uC6B4\uB370 \uD070 \uD574\uB97C \uB744\uC6B4\uB2E4 \u2014 \uC0AC\uC77C\uAC80\uC744 \uBC1B\uCE58\uB294 \uC810\uCC3D \uB0B4\uACF5\uC758 \uC815\uC810.",
        school: "qigong",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [
          { artId: "jeomchang-yeolyang-singong", minSeong: 6 },
          { artId: "jeomchang-cheongcheon-gangki", minSeong: 5 }
        ]
      },
      // ═══ 권법 (3) — 점창권 뿌리 → 일출권 → 홍일권 ═════════════════════════════
      {
        id: "jeomchang-gwon",
        name: "\uC810\uCC3D\uAD8C",
        hanjaName: "\u9EDE\u84BC\u62F3",
        description: "\uAC80\uC744 \uC7A1\uAE30 \uC804\uC5D0 \uC8FC\uBA39\uC73C\uB85C \uCC0C\uB974\uAE30\uB97C \uC775\uD78C\uB2E4 \u2014 \uC810\uCC3D\uC758 \uC785\uBB38 \uAD8C\uBC95.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest"
      },
      {
        id: "jeomchang-ilchul-gwon",
        name: "\uC77C\uCD9C\uAD8C",
        hanjaName: "\u65E5\u51FA\u62F3",
        description: "\uC218\uD3C9\uC120\uC744 \uB6AB\uACE0 \uC19F\uB294 \uD574\uCC98\uB7FC \uC544\uB798\uC5D0\uC11C \uC704\uB85C \uAFF0\uCC0C\uB974\uB294 \uC810\uCC3D\uC758 \uAD8C.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomchang-gwon", minSeong: 3 }]
      },
      {
        id: "jeomchang-hongil-gwon",
        name: "\uD64D\uC77C\uAD8C",
        hanjaName: "\u7D05\u65E5\u62F3",
        description: "\uBD89\uC740 \uD574 \uD55C \uB369\uC774\uB97C \uC8FC\uBA39\uC5D0 \uB2F4\uC544 \uB0B4\uC9C0\uB974\uB294 \uC810\uCC3D \uAD8C\uBC95\uC758 \uC815\uC810.",
        school: "fist",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "jeomchang",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomchang-ilchul-gwon", minSeong: 5 }]
      }
    ];
  }
});

// src/data/martialArts/catalog/gollyun.ts
var GOLLYUN_ARTS;
var init_gollyun = __esm({
  "src/data/martialArts/catalog/gollyun.ts"() {
    "use strict";
    GOLLYUN_ARTS = [
      // ── 검(sword) 13권 ────────────────────────────────────────────────────────
      {
        id: "gollyun-gicho-sword",
        name: "\uACE4\uB95C\uAE30\uCD08\uAC80",
        hanjaName: "\u5D11\u5D19\u57FA\u790E\u528D",
        description: "\uACE4\uB95C \uC124\uC0B0\uC758 \uC785\uBB38 \uAC80. \uD638\uD761\uC774 \uAE38\uACE0 \uBCF4\uD3ED\uC774 \uD06C\uB2E4.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest"
      },
      {
        id: "gollyun-seolpung-sword",
        name: "\uC124\uD48D\uAC80",
        hanjaName: "\u96EA\u98A8\u528D",
        description: "\uC124\uC0B0 \uACE8\uC9DC\uAE30\uB97C \uD718\uB3C4\uB294 \uCC2C\uBC14\uB78C\uC744 \uBCF8\uB72C \uACE4\uB95C\uC758 \uB458\uC9F8 \uC785\uBB38 \uAC80.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "gollyun-gicho-sword", minSeong: 3 }]
      },
      {
        id: "ullyong-sipsam-sword",
        name: "\uC6B4\uB8E1\uC2ED\uC0BC\uAC80",
        hanjaName: "\u96F2\u9F8D\u5341\u4E09\u528D",
        description: "\uAD6C\uB984 \uC18D \uC6A9\uC758 \uC5F4\uC138 \uAD7D\uC774\uB97C \uBCF8\uB72C \uACE4\uB95C \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "gollyun-gicho-sword", minSeong: 4 }]
      },
      {
        id: "gollyun-gono-sword",
        name: "\uACE4\uC624\uAC80",
        hanjaName: "\u6606\u543E\u528D",
        description: "\uC2E0\uAC80\uC744 \uBCBC\uB824\uB0C8\uB2E4\uB294 \uACE4\uC624\uC0B0\uC758 \uC774\uB984\uC744 \uBC1B\uB4E0 \uACE4\uB95C \uC911\uAE09 \uAC80. \uBCA0\uB294 \uACB0\uC774 \uBB34\uAC81\uACE0 \uACE7\uB2E4.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "gollyun-gicho-sword", minSeong: 3 }]
      },
      {
        id: "gollyun-baekun-sword",
        name: "\uBC31\uC6B4\uAC80\uBC95",
        hanjaName: "\u767D\u96F2\u528D\u6CD5",
        description: "\uD770 \uAD6C\uB984\uC774 \uBD09\uC6B0\uB9AC\uB97C \uAC10\uC2F8\uB4EF \uBD80\uB4DC\uB7FD\uAC8C \uC801\uC744 \uAC00\uB450\uB294 \uACE4\uB95C \uC911\uAE09 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "gollyun-seolpung-sword", minSeong: 3 }]
      },
      {
        id: "gollyun-bingha-sword",
        name: "\uBE59\uD558\uAC80",
        hanjaName: "\u6C37\u6CB3\u528D",
        description: "\uB9CC\uB144 \uBE59\uD558\uAC00 \uBBF8\uB044\uB7EC\uC9C0\uB4EF \uB290\uB9AC\uAC8C \uC2DC\uC791\uD574 \uBB34\uAC81\uAC8C \uB05D\uB098\uB294 \uACE4\uB95C\uC758 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "gollyun-seolpung-sword", minSeong: 3 }]
      },
      {
        id: "gollyun-okheo-sword",
        name: "\uC625\uD5C8\uAC80",
        hanjaName: "\u7389\u865B\u528D",
        description: "\uC625\uD5C8\uAD81 \uB3C4\uC778\uB4E4\uC774 \uB2E6\uC544\uC628 \uAC80. \uBE44\uC5B4 \uC788\uB294 \uB4EF\uD558\uB098 \uCC0C\uB974\uBA74 \uB9C9\uC744 \uAE38\uC774 \uC5C6\uB2E4.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "gollyun-gono-sword", minSeong: 4 }]
      },
      {
        id: "taeheo-doryong-sword",
        name: "\uD0DC\uD5C8\uB3C4\uB8E1\uAC80\uBC95",
        hanjaName: "\u592A\u865B\u5C60\u9F8D\u528D\u6CD5",
        description: "\uD5C8\uACF5\uC758 \uC6A9\uB9C8\uC800 \uBCA4\uB2E4\uB294 \uACE4\uB95C \uC0C1\uC2B9 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [
          { artId: "ullyong-sipsam-sword", minSeong: 5 },
          { artId: "ullyong-daepalsik", minSeong: 4 }
        ]
      },
      {
        id: "gollyun-seolsan-geombeop",
        name: "\uC124\uC0B0\uAC80\uBC95",
        hanjaName: "\u96EA\u5C71\u528D\u6CD5",
        description: "\uC124\uC0B0\uC758 \uACE0\uC694\uC640 \uB208\uC0AC\uD0DC\uC758 \uB9F9\uB82C\uC744 \uD55C \uC790\uB8E8\uC5D0 \uB2F4\uC740 \uACE4\uB95C \uC0C1\uC2B9 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "gollyun-baekun-sword", minSeong: 5 }]
      },
      {
        id: "gollyun-unhae-sword",
        name: "\uC6B4\uD574\uAC80",
        hanjaName: "\u96F2\u6D77\u528D",
        description: "\uAD6C\uB984 \uBC14\uB2E4\uAC00 \uBD09\uC6B0\uB9AC\uB97C \uC0BC\uD0A4\uB4EF \uAC80\uC138\uAC00 \uC0AC\uBC29\uC744 \uB36E\uB294 \uACE4\uB95C \uC0C1\uC2B9 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [
          { artId: "gollyun-okheo-sword", minSeong: 5 },
          { artId: "gollyun-bingha-sword", minSeong: 4 }
        ]
      },
      {
        id: "gollyun-seoryeong-sword",
        name: "\uC124\uB839\uAC80",
        hanjaName: "\u96EA\u5DBA\u528D",
        description: "\uB208 \uB36E\uC778 \uB9C8\uB8E8\uAE08\uCC98\uB7FC \uCC28\uACE0 \uC2DC\uB9B0 \uACE4\uB95C \uC0C1\uC2B9 \uAC80. \uB2FF\uAE30 \uC804\uC5D0 \uD55C\uAE30\uAC00 \uBA3C\uC800 \uB4E0\uB2E4.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "gollyun-bingha-sword", minSeong: 5 }]
      },
      {
        id: "gollyun-ullyong-seungcheon-sword",
        name: "\uC6B4\uB8E1\uC2B9\uCC9C\uAC80",
        hanjaName: "\u96F2\u9F8D\u6607\u5929\u528D",
        description: "\uAD6C\uB984\uC744 \uCC22\uACE0 \uC6A9\uC774 \uD558\uB298\uB85C \uC624\uB978\uB2E4 \u2014 \uACE4\uB95C \uAC80\uD559\uC774 \uBAA8\uC774\uB294 \uC815\uC810.",
        school: "sword",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [
          { artId: "taeheo-doryong-sword", minSeong: 6 },
          { artId: "gollyun-unhae-sword", minSeong: 5 }
        ]
      },
      {
        id: "gollyun-gono-sin-sword",
        name: "\uACE4\uC624\uC2E0\uAC80",
        hanjaName: "\u6606\u543E\u795E\u528D",
        description: "\uACE4\uC624\uC758 \uC1E0\uCC98\uB7FC \uBB34\uC5C7\uC774\uB4E0 \uB04A\uB294\uB2E4\uB294 \uACE4\uB95C \uBE44\uC804. \uC124\uC0B0\uAC80\uBC95\uC744 \uB05D\uAE4C\uC9C0 \uAC08\uC544\uC57C \uC787\uB294\uB2E4.",
        school: "sword",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "gollyun-seolsan-geombeop", minSeong: 7 }]
      },
      // ── 보법(lightness) 7권 ───────────────────────────────────────────────────
      {
        id: "gollyun-dapun-bo",
        name: "\uB2F5\uC6B4\uBCF4",
        hanjaName: "\u8E0F\u96F2\u6B65",
        description: "\uAD6C\uB984\uC744 \uB514\uB524\uB3CC \uC0BC\uC544 \uAC77\uB294\uB2E4\uB294 \uACE4\uB95C \uC785\uBB38 \uBCF4\uBC95.",
        school: "lightness",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "gollyun-seolhaeng-bo",
        name: "\uC124\uD589\uBCF4",
        hanjaName: "\u96EA\u884C\u6B65",
        description: "\uB208\uBC2D\uC5D0 \uBB34\uB98E\uAE4C\uC9C0 \uBE60\uC838\uB3C4 \uD750\uD2B8\uB7EC\uC9C0\uC9C0 \uC54A\uB294 \uACE4\uB95C \uC81C\uC790\uC758 \uAC78\uC74C.",
        school: "lightness",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "gollyun-neungun-bo",
        name: "\uB2A5\uC6B4\uBCF4",
        hanjaName: "\u51CC\u96F2\u6B65",
        description: "\uAD6C\uB984\uC744 \uB118\uBCF8\uB2E4\uB294 \uC774\uB984\uCC98\uB7FC \uD55C \uAC78\uC74C\uC5D0 \uD55C \uAE38\uC744 \uC19F\uB294 \uACE4\uB95C \uBCF4\uBC95.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "gollyun-dapun-bo", minSeong: 3 }]
      },
      {
        id: "gollyun-biseol-sinbeop",
        name: "\uBE44\uC124\uC2E0\uBC95",
        hanjaName: "\u98DB\u96EA\u8EAB\u6CD5",
        description: "\uD769\uB0A0\uB9AC\uB294 \uB208\uC1A1\uC774\uCC98\uB7FC \uC885\uC7A1\uC744 \uC218 \uC5C6\uC774 \uB5A0\uB3C4\uB294 \uACE4\uB95C\uC758 \uC2E0\uBC95.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "gollyun-seolhaeng-bo", minSeong: 3 }]
      },
      {
        id: "gollyun-unmu-sinbeop",
        name: "\uC6B4\uBB34\uC2E0\uBC95",
        hanjaName: "\u96F2\u9727\u8EAB\u6CD5",
        description: "\uC548\uAC1C \uC18D\uC5D0 \uBAB8\uC744 \uAC10\uCD94\uB4EF \uC794\uC0C1\uB9CC \uB0A8\uAE30\uB294 \uACE4\uB95C\uC758 \uC2E0\uBC95.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "gollyun-dapun-bo", minSeong: 4 }]
      },
      {
        id: "ullyong-daepalsik",
        name: "\uC6B4\uB8E1\uB300\uD314\uC2DD",
        hanjaName: "\u96F2\u9F8D\u5927\u516B\u5F0F",
        description: "\uD5C8\uACF5\uC5D0\uC11C \uC5EC\uB35F \uBC88 \uBAB8\uC744 \uB4A4\uC9D1\uB294 \uACE4\uB95C \uACBD\uACF5\uC758 \uC815\uC218.",
        school: "lightness",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 5 }]
      },
      {
        id: "gollyun-deungun-jong",
        name: "\uB4F1\uC6B4\uC885",
        hanjaName: "\u767B\u96F2\u7E31",
        description: "\uAD6C\uB984 \uC704\uB85C \uC19F\uAD6C\uCCD0 \uBD09\uC6B0\uB9AC\uC5D0\uC11C \uBD09\uC6B0\uB9AC\uB85C \uAC74\uB10C\uB2E4\uB294 \uACE4\uB95C \uACBD\uACF5\uC758 \uC815\uC810.",
        school: "lightness",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [
          { artId: "ullyong-daepalsik", minSeong: 6 },
          { artId: "gollyun-unmu-sinbeop", minSeong: 4 }
        ]
      },
      // ── 심법(qigong) 6권 ──────────────────────────────────────────────────────
      {
        id: "gollyun-okheo-simbeop",
        name: "\uC625\uD5C8\uC2EC\uBC95",
        hanjaName: "\u7389\u865B\u5FC3\u6CD5",
        description: "\uC625\uD5C8\uAD81\uC758 \uC0C8\uBCBD \uC815\uC88C\uC5D0\uC11C \uBE44\uB86F\uD55C \uACE4\uB95C \uC785\uBB38 \uC2EC\uBC95. \uB9D1\uACE0 \uCC28\uB2E4.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest"
      },
      {
        id: "gollyun-bingsim-gyeol",
        name: "\uBE59\uC2EC\uACB0",
        hanjaName: "\u6C37\u5FC3\u8A23",
        description: "\uC5BC\uC74C\uCC98\uB7FC \uACE0\uC694\uD55C \uB9C8\uC74C\uC5D0 \uAE30\uB97C \uAC00\uB77C\uC549\uD788\uB294 \uACE4\uB95C\uC758 \uAE30\uCD08 \uAD6C\uACB0.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "gollyun-okheo-simbeop", minSeong: 3 }]
      },
      {
        id: "gollyun-seollyeon-simgong",
        name: "\uC124\uB828\uC2EC\uACF5",
        hanjaName: "\u96EA\u84EE\u5FC3\u529F",
        description: "\uC124\uC0B0 \uAF2D\uB300\uAE30\uC5D0\uB9CC \uD540\uB2E4\uB294 \uC124\uB828\uCC98\uB7FC, \uCC2C \uACF3\uC5D0\uC11C \uB354 \uAE4A\uC5B4\uC9C0\uB294 \uACE4\uB95C\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "gollyun-bingsim-gyeol", minSeong: 4 }]
      },
      {
        id: "gollyun-okheo-jingi",
        name: "\uC625\uD5C8\uC9C4\uAE30",
        hanjaName: "\u7389\u865B\u771E\u6C23",
        description: "\uC625\uCC98\uB7FC \uB9D1\uC740 \uC9C4\uAE30\uAC00 \uB2E8\uC804\uC744 \uCC44\uC6B0\uB294 \uACE4\uB95C \uC0C1\uC2B9 \uC2EC\uBC95.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "gollyun-seollyeon-simgong", minSeong: 5 }]
      },
      {
        id: "gollyun-hancheon-singong",
        name: "\uD55C\uCC9C\uC2E0\uACF5",
        hanjaName: "\u5BD2\u5929\u795E\u529F",
        description: "\uC124\uC0B0\uC758 \uCC2C \uD558\uB298 \uAE30\uC6B4\uC744 \uB04C\uC5B4 \uC4F0\uB294 \uACE4\uB95C \uC0C1\uC2B9 \uC2EC\uBC95. \uC190\uB05D\uC5D0 \uC11C\uB9AC\uAC00 \uB9FA\uD78C\uB2E4.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "gollyun-seollyeon-simgong", minSeong: 5 }]
      },
      {
        id: "gollyun-taeeul-singong",
        name: "\uD0DC\uC744\uC2E0\uACF5",
        hanjaName: "\u592A\u4E59\u795E\u529F",
        description: "\uB9D1\uC74C\uACFC \uCC28\uAC00\uC6C0\uC774 \uD0DC\uC744\uC758 \uD55C \uAE30\uC6B4\uC73C\uB85C \uB3CC\uC544\uAC00\uB294 \uACE4\uB95C \uC7A5\uBB38 \uC804\uC2B9\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [
          { artId: "gollyun-okheo-jingi", minSeong: 6 },
          { artId: "gollyun-hancheon-singong", minSeong: 5 }
        ]
      },
      // ── 권(fist) 4권 ──────────────────────────────────────────────────────────
      {
        id: "gollyun-seolsan-gwon",
        name: "\uC124\uC0B0\uAD8C",
        hanjaName: "\u96EA\u5C71\u62F3",
        description: "\uC124\uC0B0\uCC98\uB7FC \uBB35\uC9C1\uD558\uAC8C \uBC84\uD2F0\uACE0 \uC11C\uC11C \uCE58\uB294 \uACE4\uB95C \uC785\uBB38 \uAD8C\uBC95.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest"
      },
      {
        id: "gollyun-baekseol-jang",
        name: "\uBC31\uC124\uC7A5",
        hanjaName: "\u767D\u96EA\u638C",
        description: "\uB208\uC1A1\uC774\uCC98\uB7FC \uAC00\uBCCD\uAC8C \uB2FF\uC544 \uD55C\uAE30\uB97C \uB0A8\uAE30\uB294 \uACE4\uB95C\uC758 \uAE30\uCD08 \uC7A5\uBC95.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "gollyun-seolsan-gwon", minSeong: 3 }]
      },
      {
        id: "gollyun-ullyong-jang",
        name: "\uC6B4\uB8E1\uC7A5",
        hanjaName: "\u96F2\u9F8D\u638C",
        description: "\uAD6C\uB984 \uC18D \uC6A9\uC774 \uAF2C\uB9AC\uB97C \uCE58\uB4EF \uAD7D\uC774\uCE58\uB294 \uACE4\uB95C\uC758 \uC911\uAE09 \uC7A5\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "gollyun-baekseol-jang", minSeong: 3 }]
      },
      {
        id: "gollyun-seolbung-jang",
        name: "\uC124\uBD95\uC7A5",
        hanjaName: "\u96EA\u5D29\u638C",
        description: "\uB208\uC0AC\uD0DC\uAC00 \uACE8\uC9DC\uAE30\uB97C \uC4F8\uC5B4\uB0B4\uB9AC\uB4EF \uD55C \uC7A5\uC5D0 \uBAA8\uB4E0 \uAC83\uC744 \uBC00\uC5B4\uBD99\uC774\uB294 \uACE4\uB95C \uC0C1\uC2B9 \uC7A5\uBC95.",
        school: "fist",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "gollyun",
        acquisition: "quest",
        prerequisites: [{ artId: "gollyun-ullyong-jang", minSeong: 5 }]
      }
    ];
  }
});

// src/data/martialArts/catalog/jongnam.ts
var JONGNAM_ARTS;
var init_jongnam = __esm({
  "src/data/martialArts/catalog/jongnam.ts"() {
    "use strict";
    JONGNAM_ARTS = [
      // ── 검(sword) 15권 ────────────────────────────────────────────────────────
      {
        id: "jongnam-gicho-sword",
        name: "\uC885\uB0A8\uAE30\uCD08\uAC80",
        hanjaName: "\u7D42\u5357\u57FA\u790E\u528D",
        description: "\uC885\uB0A8 \uC785\uBB38\uC81C\uC790\uC758 \uAC80. \uD654\uB824\uD568 \uC5C6\uC774 \uD55C \uD68D \uD55C \uD68D\uC774 \uC9C4\uC911\uD558\uB2E4.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest"
      },
      {
        id: "jongnam-wolha-sword",
        name: "\uC6D4\uD558\uAC80",
        hanjaName: "\u6708\u4E0B\u528D",
        description: "\uB2EC\uBE5B \uC544\uB798 \uD640\uB85C \uB2E6\uB294 \uC885\uB0A8\uC758 \uAE30\uCD08 \uAC80. \uBC24\uC774 \uAE4A\uC744\uC218\uB85D \uACB0\uC774 \uB9D1\uC544\uC9C4\uB2E4.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "jongnam-gicho-sword", minSeong: 3 }]
      },
      {
        id: "jongnam-sanmun-sword",
        name: "\uC0B0\uBB38\uAC80",
        hanjaName: "\u5C71\u9580\u528D",
        description: "\uC0B0\uBB38\uC744 \uC9C0\uD0A4\uB294 \uC81C\uC790\uB4E4\uC758 \uAC80. \uBB3C\uB7EC\uC11C\uC9C0 \uC54A\uB294 \uBC95\uBD80\uD130 \uAC00\uB974\uCE5C\uB2E4.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "jongnam-gicho-sword", minSeong: 3 }]
      },
      {
        id: "cheonha-36-sword",
        name: "\uCC9C\uD558\uC0BC\uC2ED\uC721\uAC80",
        hanjaName: "\u5929\u4E0B\u4E09\u5341\u516D\u528D",
        description: "\uC11C\uB978\uC5EC\uC12F \uCD08\uC2DD\uC73C\uB85C \uAC80\uC758 \uAE30\uBCF8\uC744 \uBAA8\uB450 \uB2F4\uC740 \uC885\uB0A8\uC758 \uBFCC\uB9AC \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest"
      },
      {
        id: "jongnam-wolyeong-sword",
        name: "\uC6D4\uC601\uAC80",
        hanjaName: "\u6708\u5F71\u528D",
        description: "\uB2EC\uADF8\uB9BC\uC790\uAC00 \uBB3C \uC704\uC5D0 \uC5B4\uB9AC\uB4EF \uAC80\uC601\uC774 \uACB9\uCCD0 \uBCF4\uC774\uB294 \uC885\uB0A8 \uC911\uAE09 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "jongnam-wolha-sword", minSeong: 4 }]
      },
      {
        id: "jongnam-yuseong-sword",
        name: "\uB099\uC131\uAC80",
        hanjaName: "\u843D\u661F\u528D",
        description: "\uBC24\uD558\uB298\uC744 \uAE0B\uB294 \uBCC4\uB625\uCC98\uB7FC \uD55C \uC904\uAE30\uB85C \uB5A8\uC5B4\uC9C0\uB294 \uC885\uB0A8\uC758 \uCF8C\uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "jongnam-wolha-sword", minSeong: 3 }]
      },
      {
        id: "jongnam-jinsan-sword",
        name: "\uC9C4\uC0B0\uAC80",
        hanjaName: "\u93AD\u5C71\u528D",
        description: "\uC0B0\uC744 \uB20C\uB7EC \uC549\uD788\uB4EF \uBB34\uAC81\uAC8C \uB0B4\uB9AC\uB204\uB974\uB294 \uC885\uB0A8 \uC911\uAE09 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "jongnam-sanmun-sword", minSeong: 3 }]
      },
      {
        id: "jongnam-gosong-sword",
        name: "\uACE0\uC1A1\uAC80",
        hanjaName: "\u5B64\u677E\u528D",
        description: "\uBCBC\uB791 \uB05D \uC678\uB85C\uC6B4 \uC18C\uB098\uBB34\uCC98\uB7FC \uD640\uB85C \uBC84\uD2F0\uBA70 \uBCA0\uB294 \uC885\uB0A8\uC758 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "jongnam-sanmun-sword", minSeong: 4 }]
      },
      {
        id: "yuun-sword",
        name: "\uC720\uC6B4\uAC80\uBC95",
        hanjaName: "\u67D4\u96F2\u528D\u6CD5",
        description: "\uAD6C\uB984\uC774 \uD750\uB974\uB4EF \uBD80\uB4DC\uB7FD\uAC8C \uC774\uC5B4\uC9C0\uB294 \uC885\uB0A8 \uC0C1\uC2B9 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "cheonha-36-sword", minSeong: 5 }]
      },
      {
        id: "wollyeo-sword",
        name: "\uC6D4\uB140\uAC80\uBC95",
        hanjaName: "\u6708\u5973\u528D\u6CD5",
        description: "\uB2EC\uBE5B \uC544\uB798 \uCDA4\uCD94\uB4EF \uC720\uB824\uD55C \uC885\uB0A8\uC758 \uAC80. \uCC9C\uD558\uC0BC\uC2ED\uC721\uAC80\uC5D0\uC11C \uAC08\uB77C\uC9C4 \uB2E4\uB978 \uD55C \uAE38.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "cheonha-36-sword", minSeong: 5 }]
      },
      {
        id: "jongnam-manwol-sword",
        name: "\uB9CC\uC6D4\uAC80\uBC95",
        hanjaName: "\u6EFF\u6708\u528D\u6CD5",
        description: "\uBCF4\uB984\uB2EC\uC774 \uCC28\uC624\uB974\uB4EF \uAC80\uC138\uAC00 \uB465\uAE00\uAC8C \uCC28\uC11C \uBE48\uD2C8\uC744 \uC9C0\uC6B0\uB294 \uC885\uB0A8 \uC0C1\uC2B9 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "jongnam-wolyeong-sword", minSeong: 5 }]
      },
      {
        id: "jongnam-cheonseong-sword",
        name: "\uCC9C\uC131\uAC80",
        hanjaName: "\u5929\u661F\u528D",
        description: "\uC3DF\uC544\uC9C0\uB294 \uBCC4\uBE5B\uCC98\uB7FC \uC5F0\uB2EC\uC544 \uB5A8\uC5B4\uC9C0\uB294 \uC885\uB0A8 \uC0C1\uC2B9 \uCF8C\uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "jongnam-yuseong-sword", minSeong: 5 }]
      },
      {
        id: "jongnam-jinak-sword",
        name: "\uC9C4\uC545\uAC80",
        hanjaName: "\u93AD\u5DBD\u528D",
        description: "\uD070 \uC0B0\uC774 \uC6C0\uC9C1\uC774\uC9C0 \uC54A\uB4EF \uD55C \uC790\uB9AC\uC5D0\uC11C \uCC9C \uAC80\uC744 \uBC1B\uC544\uB0B4\uB294 \uC885\uB0A8 \uC0C1\uC2B9 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [
          { artId: "jongnam-jinsan-sword", minSeong: 5 },
          { artId: "jongnam-gosong-sword", minSeong: 4 }
        ]
      },
      {
        id: "samrak-sword",
        name: "\uC0BC\uB77D\uAC80",
        hanjaName: "\u4E09\u6A02\u528D",
        description: "\uC138 \uAC00\uC9C0 \uC990\uAC70\uC6C0\uC744 \uB2F4\uC740 \uC885\uB0A8 \uC808\uC815\uC758 \uAC80 \u2014 \uBD80\uB4DC\uB7EC\uC6C0\uACFC \uB2EC\uBE5B\uC774 \uB2E4\uC2DC \uB9CC\uB09C\uB2E4.",
        school: "sword",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [
          { artId: "yuun-sword", minSeong: 6 },
          { artId: "wollyeo-sword", minSeong: 5 }
        ]
      },
      {
        id: "jongnam-cheonha-mugeuk-sword",
        name: "\uCC9C\uD558\uBB34\uADF9\uAC80",
        hanjaName: "\u5929\u4E0B\u7121\u6975\u528D",
        description: "\uBCC4\uACFC \uB2EC\uC774 \uD55C \uD558\uB298\uC5D0 \uB4E4 \uB4EF \uC885\uB0A8\uC758 \uBAA8\uB4E0 \uAC80\uACB0\uC774 \uD558\uB098\uB85C \uB3CC\uC544\uAC00\uB294 \uC815\uC810.",
        school: "sword",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [
          { artId: "jongnam-cheonseong-sword", minSeong: 6 },
          { artId: "jongnam-manwol-sword", minSeong: 5 }
        ]
      },
      // ── 심법(qigong) 6권 ──────────────────────────────────────────────────────
      {
        id: "jongnam-mangwol-simbeop",
        name: "\uB9DD\uC6D4\uC2EC\uBC95",
        hanjaName: "\u671B\u6708\u5FC3\u6CD5",
        description: "\uB2EC\uC744 \uBC14\uB77C\uBCF4\uBA70 \uD638\uD761\uC744 \uACE0\uB974\uB294 \uC885\uB0A8 \uC785\uBB38 \uC2EC\uBC95. \uCC28\uACE0 \uAE30\uC6B0\uB294 \uACB0\uC744 \uB530\uB978\uB2E4.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest"
      },
      {
        id: "jongnam-jwamang-gyeol",
        name: "\uC815\uAD00\uACB0",
        hanjaName: "\u975C\u89C0\u8A23",
        description: "\uC549\uC740 \uCC44 \uB098\uB97C \uC78A\uB294\uB2E4 \u2014 \uC885\uB0A8 \uB3C4\uBB38\uC758 \uAE30\uCD08 \uC815\uC88C \uAD6C\uACB0.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "jongnam-mangwol-simbeop", minSeong: 3 }]
      },
      {
        id: "jongnam-myeongwol-simgong",
        name: "\uBA85\uC6D4\uC2EC\uACF5",
        hanjaName: "\u660E\u6708\u5FC3\u529F",
        description: "\uBC1D\uC740 \uB2EC\uBE5B\uC774 \uB2E8\uC804\uC5D0 \uACE0\uC774\uB4EF \uB9D1\uC740 \uB0B4\uB825\uC744 \uC313\uB294 \uC885\uB0A8 \uC911\uAE09 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "jongnam-mangwol-simbeop", minSeong: 4 }]
      },
      {
        id: "jongnam-jao-simbeop",
        name: "\uC790\uC624\uC2EC\uBC95",
        hanjaName: "\u5B50\u5348\u5FC3\u6CD5",
        description: "\uD55C\uBC24\uACFC \uD55C\uB0AE, \uC790\uC624\uC758 \uB450 \uB54C\uC5D0 \uAE30\uB97C \uB3CC\uB9AC\uB294 \uC885\uB0A8\uC758 \uC6B4\uAE30 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "jongnam-jwamang-gyeol", minSeong: 4 }]
      },
      {
        id: "jongnam-taeeum-jingi",
        name: "\uD0DC\uC74C\uC9C4\uAE30",
        hanjaName: "\u592A\u9670\u771E\u6C23",
        description: "\uB2EC\uC758 \uC74C\uAE30\uB97C \uAE38\uC5B4 \uC62C\uB824 \uAE4A\uACE0 \uC11C\uB298\uD55C \uB0B4\uB825\uC744 \uC774\uB8E8\uB294 \uC885\uB0A8 \uC0C1\uC2B9 \uC2EC\uBC95.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "jongnam-myeongwol-simgong", minSeong: 5 }]
      },
      {
        id: "jongnam-wolhwa-singong",
        name: "\uC6D4\uD654\uC2E0\uACF5",
        hanjaName: "\u6708\u83EF\u795E\u529F",
        description: "\uB2EC\uC758 \uC815\uD654\uAC00 \uC628\uBAB8\uC744 \uB450\uB978\uB2E4\uB294 \uC885\uB0A8 \uC7A5\uBB38 \uC804\uC2B9\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "jongnam-taeeum-jingi", minSeong: 6 }]
      },
      // ── 권(fist) 5권 ──────────────────────────────────────────────────────────
      {
        id: "jongnam-banwol-gwon",
        name: "\uBC18\uC6D4\uAD8C",
        hanjaName: "\u534A\u6708\u62F3",
        description: "\uBC18\uB2EC\uCC98\uB7FC \uAD7D\uC740 \uADA4\uC801\uC73C\uB85C \uCE58\uB294 \uC885\uB0A8 \uC785\uBB38 \uAD8C\uBC95.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest"
      },
      {
        id: "jongnam-jang",
        name: "\uC885\uB0A8\uC7A5",
        hanjaName: "\u7D42\u5357\u638C",
        description: "\uC885\uB0A8\uC0B0\uC758 \uBB35\uC9C1\uD55C \uC0B0\uC138\uB97C \uADF8\uB300\uB85C \uC62E\uAE34 \uAE30\uCD08 \uC7A5\uBC95.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "jongnam-banwol-gwon", minSeong: 3 }]
      },
      {
        id: "cheondun-jangbeop",
        name: "\uCC9C\uB454\uC7A5\uBC95",
        hanjaName: "\u5929\u9041\u638C\u6CD5",
        description: "\uD558\uB298\uB85C \uC228\uB4EF \uD45C\uD640\uD55C \uC885\uB0A8\uC758 \uC7A5\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest"
      },
      {
        id: "jongnam-chusan-gwon",
        name: "\uCD94\uC0B0\uAD8C",
        hanjaName: "\u63A8\u5C71\u62F3",
        description: "\uC0B0\uC744 \uBC00\uC5B4\uB0B8\uB2E4\uB294 \uAE30\uC138\uB85C \uC77C\uC9C1\uC120\uC73C\uB85C \uBC00\uACE0 \uB4DC\uB294 \uC885\uB0A8 \uC911\uAE09 \uAD8C\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "jongnam-jang", minSeong: 3 }]
      },
      {
        id: "jongnam-bungsan-jang",
        name: "\uBD95\uC0B0\uC7A5",
        hanjaName: "\u5D29\u5C71\u638C",
        description: "\uC0B0\uC774 \uBB34\uB108\uC9C0\uB294 \uBB34\uAC8C\uB97C \uD55C \uC190\uBC14\uB2E5\uC5D0 \uC2E3\uB294 \uC885\uB0A8 \uC0C1\uC2B9 \uC7A5\uBC95.",
        school: "fist",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "cheondun-jangbeop", minSeong: 5 }]
      },
      // ── 보법(lightness) 4권 ───────────────────────────────────────────────────
      {
        id: "jongnam-dapwol-bo",
        name: "\uB2F5\uC6D4\uBCF4",
        hanjaName: "\u8E0F\u6708\u6B65",
        description: "\uB2EC\uBE5B\uC744 \uBC1F\uB4EF \uC18C\uB9AC \uC5C6\uC774 \uAC77\uB294 \uC885\uB0A8 \uC785\uBB38 \uBCF4\uBC95.",
        school: "lightness",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "jongnam-buun-sinbeop",
        name: "\uBD80\uC6B4\uC2E0\uBC95",
        hanjaName: "\u6D6E\u96F2\u8EAB\u6CD5",
        description: "\uB72C\uAD6C\uB984\uCC98\uB7FC \uBA38\uBB34\uB294 \uACF3 \uC5C6\uC774 \uD750\uB974\uB294 \uC885\uB0A8\uC758 \uC2E0\uBC95.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "jongnam-dapwol-bo", minSeong: 3 }]
      },
      {
        id: "jongnam-biwol-sinbeop",
        name: "\uBE44\uC6D4\uC2E0\uBC95",
        hanjaName: "\u98DB\u6708\u8EAB\u6CD5",
        description: "\uB2EC\uC744 \uB118\uB294\uB2E4\uB294 \uAE30\uC138\uB85C \uB2E8\uBC88\uC5D0 \uC9C0\uBD95\uC744 \uAC74\uB108\uB6F0\uB294 \uC885\uB0A8 \uC0C1\uC2B9 \uC2E0\uBC95.",
        school: "lightness",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "jongnam-buun-sinbeop", minSeong: 5 }]
      },
      {
        id: "jongnam-dapcheon-bo",
        name: "\uB2F5\uCC9C\uBCF4",
        hanjaName: "\u8E0F\u5929\u6B65",
        description: "\uD558\uB298\uC744 \uB514\uB518\uB2E4 \u2014 \uD5C8\uACF5\uC744 \uACC4\uB2E8 \uC0BC\uB294 \uC885\uB0A8 \uACBD\uACF5\uC758 \uC815\uC810.",
        school: "lightness",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "jongnam",
        acquisition: "quest",
        prerequisites: [{ artId: "jongnam-biwol-sinbeop", minSeong: 6 }]
      }
    ];
  }
});

// src/data/martialArts/catalog/cheongseong.ts
var CHEONGSEONG_ARTS;
var init_cheongseong = __esm({
  "src/data/martialArts/catalog/cheongseong.ts"() {
    "use strict";
    CHEONGSEONG_ARTS = [
      // ── 검(sword) 14권 ────────────────────────────────────────────────────────
      {
        id: "cheongseong-gicho-sword",
        name: "\uCCAD\uC131\uAE30\uCD08\uAC80",
        hanjaName: "\u9751\u57CE\u57FA\u790E\u528D",
        description: "\uCCAD\uC131 \uC785\uBB38\uC81C\uC790\uC758 \uAC80. \uBAA8\uB09C \uB370 \uC5C6\uC774 \uACE0\uB974\uB2E4.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest"
      },
      {
        id: "cheongseong-songpung-sword",
        name: "\uC1A1\uD48D\uAC80",
        hanjaName: "\u677E\u98A8\u528D",
        description: "\uC194\uC232\uC744 \uC9C0\uB098\uB294 \uBC14\uB78C \uC18C\uB9AC\uB97C \uB2EE\uC740 \uCCAD\uC131\uC758 \uAE30\uCD08 \uAC80. \uAC00\uBCCD\uACE0 \uAD70\uB354\uB354\uAE30\uAC00 \uC5C6\uB2E4.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongseong-gicho-sword", minSeong: 3 }]
      },
      {
        id: "cheongseong-cheonggye-sword",
        name: "\uCCAD\uACC4\uAC80",
        hanjaName: "\u6DF8\u6EAA\u528D",
        description: "\uB9D1\uC740 \uACE8\uC9DC\uAE30 \uBB3C\uCC98\uB7FC \uB04A\uAE30\uC9C0 \uC54A\uACE0 \uC774\uC5B4\uC9C0\uB294 \uCCAD\uC131\uC758 \uAE30\uCD08 \uAC80.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongseong-gicho-sword", minSeong: 3 }]
      },
      {
        id: "cheongpung-sword",
        name: "\uCCAD\uD48D\uAC80",
        hanjaName: "\u6DF8\u98A8\u528D",
        description: "\uB9D1\uC740 \uBC14\uB78C\uCC98\uB7FC \uAD70\uB354\uB354\uAE30 \uC5C6\uB294 \uCCAD\uC131\uC758 \uC911\uAE09 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongseong-gicho-sword", minSeong: 3 }]
      },
      {
        id: "cheongseong-cheongun-sword",
        name: "\uCCAD\uC6B4\uAC80",
        hanjaName: "\u9751\u96F2\u528D",
        description: "\uD478\uB978 \uAD6C\uB984\uC774 \uBE44\uB07C\uB4EF \uBE44\uC2A4\uB4EC\uD788 \uD758\uB824 \uBCA0\uB294 \uCCAD\uC131 \uC911\uAE09 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongseong-songpung-sword", minSeong: 3 }]
      },
      {
        id: "cheongseong-soyo-sword",
        name: "\uC18C\uC694\uAC80",
        hanjaName: "\u900D\u9059\u528D",
        description: "\uC5BD\uB9E4\uC784 \uC5C6\uC774 \uB178\uB2D0 \uB4EF \uD3BC\uCE58\uB294 \uCCAD\uC131\uC758 \uAC80. \uC18C\uD0C8\uD55C \uAC89\uC5D0 \uB9E4\uC11C\uC6C0\uC744 \uC228\uACBC\uB2E4.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongseong-songpung-sword", minSeong: 3 }]
      },
      {
        id: "cheongseong-jukyeop-sword",
        name: "\uC8FD\uC5FD\uAC80",
        hanjaName: "\u7AF9\u8449\u528D",
        description: "\uB313\uC78E\uC774 \uBC14\uB78C\uC5D0 \uC2A4\uCE58\uB4EF \uC798\uACE0 \uBE60\uB974\uAC8C \uBCA0\uC5B4\uB4DC\uB294 \uCCAD\uC131 \uC911\uAE09 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongseong-cheonggye-sword", minSeong: 3 }]
      },
      {
        id: "cheongseong-yusu-sword",
        name: "\uC720\uC218\uAC80",
        hanjaName: "\u6D41\u6C34\u528D",
        description: "\uD750\uB974\uB294 \uBB3C\uC740 \uB2E4\uD22C\uC9C0 \uC54A\uC73C\uB098 \uB05D\uB0B4 \uBC14\uC704\uB97C \uAC00\uB978\uB2E4 \u2014 \uCCAD\uC131 \uC911\uAE09 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongseong-cheonggye-sword", minSeong: 3 }]
      },
      {
        id: "cheongun-jeokha-sword",
        name: "\uCCAD\uC6B4\uC801\uD558\uAC80",
        hanjaName: "\u9751\u96F2\u8D64\u971E\u528D",
        description: "\uD478\uB978 \uAD6C\uB984\uACFC \uBD89\uC740 \uB178\uC744, \uB450 \uAC80\uACB0\uC744 \uD558\uB098\uB85C \uD569\uCE5C \uCCAD\uC131 \uBE44\uC804.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongpung-sword", minSeong: 5 }]
      },
      {
        id: "cheondun-sword",
        name: "\uCC9C\uB454\uAC80",
        hanjaName: "\u5929\u9041\u528D",
        description: "\uD55C(\u72E0)\xB7\uC900(\u4FCA)\xB7\uCCA9(\u6377)\xB7\uBCC0(\u8B8A) \uB124 \uACB0\uC744 \uAC16\uCD98 \uCCAD\uC131\uC758 \uC885\uC801 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongpung-sword", minSeong: 5 }]
      },
      {
        id: "cheongseong-cheongmyeong-geombeop",
        name: "\uCCAD\uBA85\uAC80\uBC95",
        hanjaName: "\u6DF8\u660E\u528D\u6CD5",
        description: "\uBE44 \uAC20 \uD558\uB298\uCC98\uB7FC \uB9D1\uAC8C \uD2B8\uC778 \uAC80\uB85C\uB85C \uC801\uC758 \uC5B4\uC9C0\uB7EC\uC6B4 \uCD08\uC2DD\uC744 \uAC77\uC5B4\uB0B4\uB294 \uCCAD\uC131 \uC0C1\uC2B9 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [
          { artId: "cheongseong-yusu-sword", minSeong: 5 },
          { artId: "cheongseong-cheongun-sword", minSeong: 5 }
        ]
      },
      {
        id: "cheongseong-muheun-sword",
        name: "\uC81C\uC6B4\uAC80",
        hanjaName: "\u9F4A\u96F2\u528D",
        description: "\uBC14\uB78C\uC774 \uC9C0\uB098\uAC04 \uC790\uB9AC\uCC98\uB7FC \uD754\uC801\uC744 \uB0A8\uAE30\uC9C0 \uC54A\uB294 \uCCAD\uC131 \uC0C1\uC2B9 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongseong-soyo-sword", minSeong: 5 }]
      },
      {
        id: "cheongseong-jeokha-jangcheon-sword",
        name: "\uC801\uD558\uC7A5\uCC9C\uAC80",
        hanjaName: "\u8D64\u971E\u9577\u5929\u528D",
        description: "\uBD89\uC740 \uB178\uC744\uC774 \uAE34 \uD558\uB298\uC744 \uBB3C\uB4E4\uC774\uB4EF \uAC80\uC138\uAC00 \uB05D\uC5C6\uC774 \uC774\uC5B4\uC9C0\uB294 \uCCAD\uC131 \uAC80\uD559\uC758 \uC815\uC810.",
        school: "sword",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [
          { artId: "cheongun-jeokha-sword", minSeong: 6 },
          { artId: "cheondun-sword", minSeong: 5 }
        ]
      },
      {
        id: "cheongseong-malli-cheongpung-sword",
        name: "\uB9CC\uB9AC\uCCAD\uD48D\uAC80",
        hanjaName: "\u842C\u91CC\u6DF8\u98A8\u528D",
        description: "\uB9CC \uB9AC\uB97C \uAC00\uB3C4 \uB9C9\uD788\uC9C0 \uC54A\uB294 \uB9D1\uC740 \uBC14\uB78C \u2014 \uD754\uC801 \uC5C6\uB294 \uAC80\uACFC \uB9D1\uC740 \uAC80\uC774 \uB2E4\uC2DC \uB9CC\uB098\uB294 \uC808\uD488.",
        school: "sword",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [
          { artId: "cheongseong-muheun-sword", minSeong: 6 },
          { artId: "cheongseong-cheongmyeong-geombeop", minSeong: 5 }
        ]
      },
      // ── 심법(qigong) 7권 ──────────────────────────────────────────────────────
      {
        id: "cheongseong-cheongsim-gyeol",
        name: "\uCCAD\uC2EC\uACB0",
        hanjaName: "\u6DF8\u5FC3\u8A23",
        description: "\uB9C8\uC74C\uC744 \uB9D1\uAC8C \uD5F9\uAD6C\uB294 \uCCAD\uC131 \uC785\uBB38 \uAD6C\uACB0. \uBAA8\uB4E0 \uCCAD\uC131 \uB0B4\uACF5\uC758 \uCCAB \uB2E8\uCD94.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest"
      },
      {
        id: "cheongseong-songpung-simbeop",
        name: "\uC1A1\uD48D\uC2EC\uBC95",
        hanjaName: "\u677E\u98A8\u5FC3\u6CD5",
        description: "\uC194\uBC14\uB78C \uC18C\uB9AC\uC5D0 \uD638\uD761\uC744 \uB9DE\uCD94\uB294 \uCCAD\uC131\uC758 \uAE30\uCD08 \uC2EC\uBC95.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongseong-cheongsim-gyeol", minSeong: 3 }]
      },
      {
        id: "cheongseong-cheongun-gigong",
        name: "\uCCAD\uC6B4\uAE30\uACF5",
        hanjaName: "\u9751\u96F2\u6C23\u529F",
        description: "\uD478\uB978 \uAD6C\uB984\uC774 \uD53C\uC5B4\uC624\uB974\uB4EF \uB0B4\uB825\uC774 \uAC00\uBCCD\uACE0 \uBE60\uB974\uAC8C \uB3C4\uB294 \uCCAD\uC131 \uC911\uAE09 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongseong-cheongsim-gyeol", minSeong: 4 }]
      },
      {
        id: "cheongseong-jeokha-simbeop",
        name: "\uC801\uD558\uC2EC\uBC95",
        hanjaName: "\u8D64\u971E\u5FC3\u6CD5",
        description: "\uC800\uB141\uB178\uC744\uC758 \uB530\uB73B\uD55C \uAE30\uC6B4\uC744 \uB2E8\uC804\uC5D0 \uAC70\uB450\uB294 \uCCAD\uC131 \uC911\uAE09 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongseong-songpung-simbeop", minSeong: 4 }]
      },
      {
        id: "daera-singong",
        name: "\uB300\uB77C\uC2E0\uACF5",
        hanjaName: "\u5927\u7F85\u795E\u529F",
        description: "\uD558\uB298 \uADF8\uBB3C\uCC98\uB7FC \uB113\uACE0 \uACE0\uB978 \uCCAD\uC131\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest"
      },
      {
        id: "cheongseong-cheongryeong-jingi",
        name: "\uCCAD\uB839\uC9C4\uAE30",
        hanjaName: "\u6DF8\u9748\u771E\u6C23",
        description: "\uB9D1\uACE0 \uC2E0\uB839\uD55C \uC9C4\uAE30\uAC00 \uC628\uBAB8\uC758 \uB9E5\uC744 \uC53B\uC5B4\uB0B4\uB9AC\uB294 \uCCAD\uC131 \uC0C1\uC2B9 \uC2EC\uBC95.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongseong-cheongun-gigong", minSeong: 5 }]
      },
      {
        id: "cheongseong-cheongheo-singong",
        name: "\uCCAD\uD5C8\uC2E0\uACF5",
        hanjaName: "\u6DF8\u865B\u795E\u529F",
        description: "\uB9D1\uC74C\uC774 \uBE44\uC6C0\uC5D0 \uC774\uB974\uB7EC \uD558\uB298\uACFC \uD1B5\uD55C\uB2E4\uB294 \uCCAD\uC131 \uC7A5\uBB38 \uC804\uC2B9\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [
          { artId: "cheongseong-cheongryeong-jingi", minSeong: 6 },
          { artId: "daera-singong", minSeong: 5 }
        ]
      },
      // ── 권(fist) 5권 ──────────────────────────────────────────────────────────
      {
        id: "cheongseong-songhak-gwon",
        name: "\uC1A1\uD559\uAD8C",
        hanjaName: "\u677E\u9DB4\u62F3",
        description: "\uC18C\uB098\uBB34 \uC704 \uD559\uC758 \uC790\uD0DC\uB97C \uBCF8\uB72C \uCCAD\uC131 \uC785\uBB38 \uAD8C\uBC95. \uAC00\uBCCD\uAC8C \uC11C\uACE0 \uACE7\uAC8C \uCE5C\uB2E4.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest"
      },
      {
        id: "cheongseong-cheongpung-jang",
        name: "\uCCAD\uD48D\uC7A5",
        hanjaName: "\u6DF8\u98A8\u638C",
        description: "\uB9D1\uC740 \uBC14\uB78C\uC774 \uC2A4\uCE58\uB4EF \uBD80\uB4DC\uB7FD\uAC8C \uB2FF\uC544 \uBA40\uB9AC \uBC00\uC5B4\uB0B4\uB294 \uCCAD\uC131\uC758 \uAE30\uCD08 \uC7A5\uBC95.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongseong-songhak-gwon", minSeong: 3 }]
      },
      {
        id: "cheongseong-baekhak-jang",
        name: "\uBC31\uD559\uC7A5",
        hanjaName: "\u767D\u9DB4\u638C",
        description: "\uD770 \uD559\uC774 \uB0A0\uAC1C\uB97C \uD3B4\uB4EF \uD06C\uAC8C \uD718\uB458\uB7EC \uCE58\uB294 \uCCAD\uC131 \uC911\uAE09 \uC7A5\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongseong-cheongpung-jang", minSeong: 3 }]
      },
      {
        id: "cheongseong-nakha-jang",
        name: "\uB099\uD558\uC7A5",
        hanjaName: "\u843D\u971E\u638C",
        description: "\uC9C0\uB294 \uB178\uC744\uBE5B\uCC98\uB7FC \uB290\uB9AC\uAC8C \uC640\uC11C \uB728\uAC81\uAC8C \uB0A8\uB294 \uCCAD\uC131 \uC911\uAE09 \uC7A5\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongseong-cheongpung-jang", minSeong: 4 }]
      },
      {
        id: "cheongseong-cheonghak-sinjang",
        name: "\uCCAD\uD559\uC2E0\uC7A5",
        hanjaName: "\u9751\u9DB4\u795E\u638C",
        description: "\uD478\uB978 \uD559\uC774 \uAD6C\uB984\uC744 \uCC28\uACE0 \uC624\uB974\uB4EF \uC7A5\uC138\uAC00 \uC19F\uAD6C\uCE58\uB294 \uCCAD\uC131 \uC0C1\uC2B9 \uC7A5\uBC95.",
        school: "fist",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongseong-baekhak-jang", minSeong: 5 }]
      },
      // ── 보법(lightness) 4권 ───────────────────────────────────────────────────
      {
        id: "cheongseong-cheongpung-bo",
        name: "\uCCAD\uD48D\uBCF4",
        hanjaName: "\u6DF8\u98A8\u6B65",
        description: "\uB9D1\uC740 \uBC14\uB78C\uACB0\uC744 \uD0C0\uB4EF \uAC00\uBCCD\uAC8C \uD750\uB974\uB294 \uCCAD\uC131 \uC785\uBB38 \uBCF4\uBC95.",
        school: "lightness",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "cheongseong-pyoyeon-sinbeop",
        name: "\uD45C\uC5F0\uC2E0\uBC95",
        hanjaName: "\u98C4\u7136\u8EAB\u6CD5",
        description: "\uBC14\uB78C \uB530\uB77C \uD45C\uC5F0\uD788 \uB5A0\uB3C4\uB294 \uCCAD\uC131\uC758 \uC2E0\uBC95. \uC7A1\uC73C\uB824\uB294 \uC190\uC774 \uB298 \uD55C \uBF18 \uB2A6\uB294\uB2E4.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongseong-cheongpung-bo", minSeong: 3 }]
      },
      {
        id: "cheongseong-seungpung-bo",
        name: "\uC2B9\uD48D\uBCF4",
        hanjaName: "\u4E58\u98A8\u6B65",
        description: "\uBC14\uB78C\uC744 \uC62C\uB77C\uD0C0\uACE0 \uACE8\uC9DC\uAE30\uB97C \uB2E8\uC228\uC5D0 \uAC74\uB108\uB294 \uCCAD\uC131 \uC0C1\uC2B9 \uBCF4\uBC95.",
        school: "lightness",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongseong-pyoyeon-sinbeop", minSeong: 5 }]
      },
      {
        id: "cheongseong-neungpung-heodo",
        name: "\uB2A5\uD48D\uD5C8\uB3C4",
        hanjaName: "\u51CC\u98A8\u865B\u6E21",
        description: "\uBC14\uB78C\uC744 \uB204\uB974\uACE0 \uD5C8\uACF5\uC744 \uAC74\uB10C\uB2E4 \u2014 \uCCAD\uC131 \uACBD\uACF5\uC758 \uC815\uC810.",
        school: "lightness",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "cheongseong",
        acquisition: "quest",
        prerequisites: [{ artId: "cheongseong-seungpung-bo", minSeong: 6 }]
      }
    ];
  }
});

// src/data/martialArts/catalog/gongdong.ts
var GONGDONG_ARTS;
var init_gongdong = __esm({
  "src/data/martialArts/catalog/gongdong.ts"() {
    "use strict";
    GONGDONG_ARTS = [
      // ─── 검(sword) 12권 — 복마·참마 / 현천·뇌정 두 줄기 ───
      {
        id: "bongma-gicho-sword",
        name: "\uBCF5\uB9C8\uAE30\uCD08\uAC80",
        hanjaName: "\u4F0F\u9B54\u57FA\u790E\u528D",
        description: "\uB9C8\uB97C \uBCA0\uAE30 \uC704\uD574 \uBCBC\uB9B0 \uACF5\uB3D9\uC758 \uC785\uBB38 \uAC80.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest"
      },
      {
        id: "gongdong-hyeoncheon-gicho-sword",
        name: "\uD604\uCC9C\uAE30\uCD08\uAC80",
        hanjaName: "\u7384\u5929\u57FA\u790E\u528D",
        description: "\uAC80\uB05D\uC5D0 \uD604\uCC9C(\u7384\u5929)\uC758 \uACE0\uC694\uB97C \uC2E3\uB294 \uACF5\uB3D9\uC758 \uB610 \uB2E4\uB978 \uC785\uBB38 \uAC80.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest"
      },
      {
        id: "gwangjin-sword",
        name: "\uAD11\uC9C4\uAC80",
        hanjaName: "\u5149\u771E\u528D",
        description: "\uBE5B\uCC98\uB7FC \uACE7\uAC8C \uC9C4(\u771E)\uC744 \uAFF0\uB294 \uACF5\uB3D9\uC758 \uC911\uAE09 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "bongma-gicho-sword", minSeong: 3 }]
      },
      {
        id: "gongdong-noeseong-sword",
        name: "\uB1CC\uC131\uAC80",
        hanjaName: "\u96F7\u8072\u528D",
        description: "\uC6B0\uB808 \uC18C\uB9AC\uAC00 \uAC80\uB05D\uC5D0\uC11C \uBA3C\uC800 \uC6B0\uB294 \uACF5\uB3D9\uC758 \uC911\uAE09 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "bongma-gicho-sword", minSeong: 3 }]
      },
      {
        id: "gongdong-chamma-sword",
        name: "\uCC38\uB9C8\uAC80",
        hanjaName: "\u65AC\u9B54\u528D",
        description: "\uB9C8\uB97C \uBCA4\uB2E4\uB294 \uC77C\uB150 \uD558\uB098\uB85C \uACE7\uAC8C \uB0B4\uB9AC\uAE0B\uB294 \uACF5\uB3D9\uC758 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "gongdong-hyeoncheon-gicho-sword", minSeong: 3 }]
      },
      {
        id: "gongdong-hyeoncheon-sword",
        name: "\uD604\uCC9C\uAC80\uBC95",
        hanjaName: "\u7384\u5929\u528D\u6CD5",
        description: "\uAC80\uC740 \uD558\uB298\uC758 \uAE4A\uC774\uB97C \uAC80\uACB0\uC5D0 \uB2F4\uC740 \uACF5\uB3D9\uC758 \uC911\uAE09 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "gongdong-hyeoncheon-gicho-sword", minSeong: 4 }]
      },
      {
        id: "bongma-sword",
        name: "\uBCF5\uB9C8\uAC80\uBC95",
        hanjaName: "\u4F0F\u9B54\u528D\u6CD5",
        description: "\uB9C8\uAD50\uB97C \uC0C1\uB300\uB85C \uBCBC\uB824\uC628 \uACF5\uB3D9 \uC9C4\uC0B0\uC808\uAE30. \uC0AC\uC545\uD55C \uAE30\uC6B4 \uC55E\uC5D0\uC11C \uB354 \uB9E4\uC12D\uB2E4.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "gwangjin-sword", minSeong: 5 }]
      },
      {
        id: "gongdong-noejeong-sword",
        name: "\uB1CC\uC815\uAC80\uBC95",
        hanjaName: "\u96F7\u9706\u528D\u6CD5",
        description: "\uBCBC\uB77D\uC774 \uB0B4\uB9AC\uAF42\uD788\uB4EF \uD55C \uD638\uD761\uC5D0 \uC2B9\uBD80\uB97C \uB05D\uB0B4\uB294 \uACF5\uB3D9\uC758 \uC0C1\uC2B9 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "gongdong-noeseong-sword", minSeong: 5 }]
      },
      {
        id: "gongdong-chamsa-sword",
        name: "\uCC38\uC0AC\uAC80",
        hanjaName: "\u65AC\u90AA\u528D",
        description: "\uC0AC\uC545\uD55C \uAC83\uC740 \uAE30\uC5B4\uC774 \uBCA0\uACE0\uC57C \uB9CC\uB2E4 \u2014 \uACF5\uB3D9 \uAC80\uC758 \uB9E4\uC11C\uC6B4 \uAC08\uB798.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "gongdong-chamma-sword", minSeong: 5 }]
      },
      {
        id: "gongdong-hyeoncheon-geomgyeol",
        name: "\uD604\uCC9C\uAC80\uACB0",
        hanjaName: "\u7384\u5929\u528D\u8A23",
        description: "\uD604\uCC9C\uC758 \uBB18\uB9AC\uAC00 \uBB34\uB974\uC775\uC5B4 \uAC80\uACFC \uB9C8\uC74C\uC774 \uD558\uB098 \uB418\uB294 \uACF5\uB3D9\uC758 \uC0C1\uC2B9 \uAC80\uACB0.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "gongdong-hyeoncheon-sword", minSeong: 5 }]
      },
      {
        id: "gongdong-bongma-singeom",
        name: "\uBCF5\uB9C8\uC2E0\uAC80",
        hanjaName: "\u4F0F\u9B54\u795E\u528D",
        description: "\uBCF5\uB9C8\uC640 \uCC38\uC0AC \uB450 \uAE38\uC774 \uB2E4\uC2DC \uB9CC\uB098 \uB9C8(\u9B54)\uC758 \uC228\uD1B5\uC744 \uB04A\uB294 \uACF5\uB3D9 \uAC80\uC758 \uC815\uC810.",
        school: "sword",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [
          { artId: "bongma-sword", minSeong: 6 },
          { artId: "gongdong-chamsa-sword", minSeong: 5 }
        ]
      },
      {
        id: "gongdong-hyeoncheon-mugeuk-sword",
        name: "\uD604\uCC9C\uBB34\uADF9\uAC80",
        hanjaName: "\u7384\u5929\u7121\u6975\u528D",
        description: "\uD604\uCC9C\uACFC \uC6B0\uB808\uAC00 \uBB34\uADF9\uC5D0\uC11C \uD558\uB098\uB85C \uD569\uCCD0\uC9C0\uB294 \uACF5\uB3D9 \uBE44\uC804\uC758 \uB05D.",
        school: "sword",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [
          { artId: "gongdong-hyeoncheon-geomgyeol", minSeong: 6 },
          { artId: "gongdong-noejeong-sword", minSeong: 5 }
        ]
      },
      // ─── 권(fist) 8권 — 복마·항마 / 통천·우레 두 줄기 ───
      {
        id: "gongdong-bongma-gwon",
        name: "\uBCF5\uB9C8\uAD8C",
        hanjaName: "\u4F0F\u9B54\u62F3",
        description: "\uB9C8\uB97C \uC5CE\uB4DC\uB9AC\uAC8C \uD558\uB294 \uACF5\uB3D9 \uAD8C\uBC95\uC758 \uCCAB\uAC78\uC74C.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest"
      },
      {
        id: "gongdong-byeokma-jang",
        name: "\uBCBD\uB9C8\uC7A5",
        hanjaName: "\u8F9F\u9B54\u638C",
        description: "\uC0BF\uB41C \uAC83\uC744 \uC190\uBC14\uB2E5\uC73C\uB85C \uBB3C\uB9AC\uCE58\uB294 \uACF5\uB3D9\uC758 \uAE30\uCD08 \uC7A5\uBC95.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "gongdong-bongma-gwon", minSeong: 3 }]
      },
      {
        id: "tongcheon-jang",
        name: "\uD1B5\uCC9C\uC7A5",
        hanjaName: "\u901A\u5929\u638C",
        description: "\uD558\uB298\uC5D0 \uB2FF\uB294\uB2E4\uB294 \uACF5\uB3D9\uC758 \uC7A5\uBC95. \uC190\uBC14\uB2E5\uC5D0 \uC6B0\uB808\uB97C \uC2E3\uB294\uB2E4.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest"
      },
      {
        id: "gongdong-jinroe-gwon",
        name: "\uC9C4\uB8B0\uAD8C",
        hanjaName: "\u9707\u96F7\u62F3",
        description: "\uC8FC\uBA39\uC774 \uB2FF\uAE30 \uC804\uC5D0 \uC6B0\uB808\uAC00 \uBA3C\uC800 \uC6B0\uB294 \uACF5\uB3D9\uC758 \uAD8C\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "gongdong-bongma-gwon", minSeong: 3 }]
      },
      {
        id: "gongdong-hangma-jang",
        name: "\uD56D\uB9C8\uC7A5",
        hanjaName: "\u964D\u9B54\u638C",
        description: "\uB9C8\uB97C \uB0B4\uB9AC\uB204\uB974\uB294 \uBB35\uC9C1\uD55C \uACF5\uB3D9\uC758 \uC7A5\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "gongdong-byeokma-jang", minSeong: 3 }]
      },
      {
        id: "chilsang-gwon",
        name: "\uCE60\uC0C1\uAD8C",
        hanjaName: "\u4E03\u50B7\u62F3",
        description: "\uC77C\uACF1\uC744 \uC0C1\uD558\uAC8C \uD558\uB294 \uAD8C \u2014 \uC801\uC744 \uBD80\uC218\uAE30 \uC804\uC5D0 \uC81C \uBAB8\uB3C4 \uAC09\uB294\uB2E4.",
        school: "fist",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "tongcheon-jang", minSeong: 5 }]
      },
      {
        id: "gongdong-noeum-jang",
        name: "\uB1CC\uC74C\uC7A5",
        hanjaName: "\u96F7\u97F3\u638C",
        description: "\uC7A5\uD48D\uBCF4\uB2E4 \uC6B0\uB808 \uC18C\uB9AC\uAC00 \uBA3C\uC800 \uC801\uC758 \uC2EC\uB9E5\uC744 \uD754\uB4DC\uB294 \uACF5\uB3D9\uC758 \uC0C1\uC2B9 \uC7A5\uBC95.",
        school: "fist",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "gongdong-jinroe-gwon", minSeong: 5 }]
      },
      {
        id: "gongdong-hangma-sinjang",
        name: "\uD56D\uB9C8\uC2E0\uC7A5",
        hanjaName: "\u964D\u9B54\u795E\u638C",
        description: "\uC6B0\uB808\uC640 \uCE60\uC0C1\uC758 \uD798\uC774 \uD55C \uC190\uBC14\uB2E5\uC5D0 \uBAA8\uC774\uB294 \uACF5\uB3D9 \uC7A5\uBC95\uC758 \uC815\uC810.",
        school: "fist",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [
          { artId: "gongdong-noeum-jang", minSeong: 6 },
          { artId: "chilsang-gwon", minSeong: 5 }
        ]
      },
      // ─── 심법(qigong) 6권 — 현천 정종 + 진뢰 보조 ───
      {
        id: "gongdong-hyeoncheon-gigong",
        name: "\uD604\uCC9C\uAE30\uACF5",
        hanjaName: "\u7384\u5929\u6C23\u529F",
        description: "\uACF5\uB3D9 \uC785\uBB38\uC81C\uC790\uC758 \uAE30\uCD08 \uC2EC\uBC95. \uCC28\uACE0 \uB9D1\uC740 \uAE30\uC6B4\uC774 \uB2E8\uC804\uC5D0 \uACE0\uC778\uB2E4.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest"
      },
      {
        id: "gongdong-bongma-simgyeol",
        name: "\uBCF5\uB9C8\uC2EC\uACB0",
        hanjaName: "\u4F0F\u9B54\u5FC3\u8A23",
        description: "\uB9C8\uB97C \uB9C8\uC8FC\uD574\uB3C4 \uD754\uB4E4\uB9AC\uC9C0 \uC54A\uB294 \uB9C8\uC74C\uC744 \uAE30\uB974\uB294 \uACF5\uB3D9\uC758 \uAD6C\uACB0.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "gongdong-hyeoncheon-gigong", minSeong: 3 }]
      },
      {
        id: "gongdong-hyeoncheon-simbeop",
        name: "\uD604\uCC9C\uC2EC\uBC95",
        hanjaName: "\u7384\u5929\u5FC3\u6CD5",
        description: "\uD604\uCC9C\uC758 \uAE4A\uC774\uB97C \uB2E8\uC804\uC5D0 \uC0C8\uAE30\uB294 \uACF5\uB3D9 \uC815\uC885 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "gongdong-hyeoncheon-gigong", minSeong: 3 }]
      },
      {
        id: "gongdong-jinroe-simgong",
        name: "\uC9C4\uB8B0\uC2EC\uACF5",
        hanjaName: "\u9707\u96F7\u5FC3\u529F",
        description: "\uC6B0\uB808\uC758 \uAE30\uC138\uB97C \uB0B4\uB825\uC5D0 \uC2E3\uB294 \uACF5\uB3D9\uC758 \uC2EC\uACF5.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "gongdong-bongma-simgyeol", minSeong: 4 }]
      },
      {
        id: "gongdong-hyeoncheon-gangki",
        name: "\uD604\uCC9C\uAC15\uAE30",
        hanjaName: "\u7384\u5929\u7F61\u6C23",
        description: "\uAC80\uC740 \uD558\uB298\uC758 \uAC15\uAE30\uAC00 \uBAB8\uC744 \uB450\uB974\uB294 \uACF5\uB3D9 \uC0C1\uC2B9 \uC2EC\uBC95.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "gongdong-hyeoncheon-simbeop", minSeong: 5 }]
      },
      {
        id: "gongdong-hyeoncheon-singong",
        name: "\uD604\uCC9C\uC2E0\uACF5",
        hanjaName: "\u7384\u5929\u795E\u529F",
        description: "\uD604\uCC9C\uACFC \uC6B0\uB808\uAC00 \uD55C \uC904\uAE30\uB85C \uD569\uCCD0\uC9C0\uB294 \uACF5\uB3D9 \uC7A5\uBB38 \uBE44\uC804 \uC2EC\uBC95.",
        school: "qigong",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [
          { artId: "gongdong-hyeoncheon-gangki", minSeong: 6 },
          { artId: "gongdong-jinroe-simgong", minSeong: 4 }
        ]
      },
      // ─── 보법(lightness) 4권 — 복마·답뢰 → 현천신법 ───
      {
        id: "gongdong-bongma-bo",
        name: "\uBCF5\uB9C8\uBCF4",
        hanjaName: "\u4F0F\u9B54\u6B65",
        description: "\uB9C8\uB97C \uCAD3\uB294 \uAC78\uC74C \u2014 \uACF5\uB3D9 \uBCF4\uBC95\uC758 \uCCAB\uBC1C.",
        school: "lightness",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "gongdong-hyeoncheon-bo",
        name: "\uD604\uCC9C\uBCF4",
        hanjaName: "\u7384\u5929\u6B65",
        description: "\uC5B4\uB450\uC6B4 \uD558\uB298 \uC544\uB798 \uC18C\uB9AC \uC5C6\uC774 \uC790\uB9AC\uB97C \uC62E\uAE30\uB294 \uACF5\uB3D9\uC758 \uAC78\uC74C.",
        school: "lightness",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "gongdong-damnoe-bo",
        name: "\uB2F5\uB8B0\uBCF4",
        hanjaName: "\u8E0F\u96F7\u6B65",
        description: "\uC6B0\uB808\uB97C \uBC1F\uACE0 \uB0B4\uB2EB\uB4EF \uD55C \uAC78\uC74C\uC5D0 \uAE30\uC138\uB97C \uC2E3\uB294 \uACF5\uB3D9\uC758 \uBCF4\uBC95.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "gongdong-bongma-bo", minSeong: 3 }]
      },
      {
        id: "gongdong-hyeoncheon-sinbeop",
        name: "\uD604\uCC9C\uC2E0\uBC95",
        hanjaName: "\u7384\u5929\u8EAB\u6CD5",
        description: "\uBAB8\uC774 \uD604\uCC9C\uC5D0 \uB179\uC544\uB4E4\uB4EF \uC885\uC801\uC774 \uC0AC\uB77C\uC9C0\uB294 \uACF5\uB3D9 \uC2E0\uBC95\uC758 \uC815\uC218.",
        school: "lightness",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "gongdong",
        acquisition: "quest",
        prerequisites: [{ artId: "gongdong-damnoe-bo", minSeong: 5 }]
      }
    ];
  }
});

// src/data/martialArts/catalog/namgung.ts
var NAMGUNG_ARTS;
var init_namgung = __esm({
  "src/data/martialArts/catalog/namgung.ts"() {
    "use strict";
    NAMGUNG_ARTS = [
      // ─── 검(sword) 16권 — 창궁·뇌전 / 검가·창천 두 줄기 ───
      {
        id: "changgung-gicho-sword",
        name: "\uCC3D\uAD81\uAE30\uCD08\uAC80",
        hanjaName: "\u84BC\u7A79\u57FA\u790E\u528D",
        description: "\uD478\uB978 \uD558\uB298\uC744 \uD5A5\uD574 \uACE7\uAC8C \uBED7\uB294 \uB0A8\uAD81\uAC00\uC758 \uC785\uBB38 \uAC80.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest"
      },
      {
        id: "namgung-geomga-gicho-sword",
        name: "\uAC80\uAC00\uAE30\uCD08\uAC80",
        hanjaName: "\u528D\u5BB6\u57FA\u790E\u528D",
        description: "\uAC80\uAC00(\u528D\u5BB6) \uB0A8\uAD81\uC758 \uC544\uC774\uB4E4\uC774 \uCC98\uC74C \uC7A1\uB294 \uB610 \uD558\uB098\uC758 \uC785\uBB38 \uAC80.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest"
      },
      {
        id: "namgung-cheongcheon-sword",
        name: "\uCCAD\uCC9C\uAC80",
        hanjaName: "\u9751\u5929\u528D",
        description: "\uB9D1\uAC8C \uAC20 \uD558\uB298\uCC98\uB7FC \uAD70\uB354\uB354\uAE30 \uC5C6\uB294 \uB0A8\uAD81\uAC00\uC758 \uAE30\uCD08 \uAC80.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "namgung-geomga-gicho-sword", minSeong: 3 }]
      },
      {
        id: "namgung-daeyeon-sword",
        name: "\uB300\uC5F0\uAC80\uBC95",
        hanjaName: "\u5927\u884D\u528D\u6CD5",
        description: "\uD06C\uAC8C \uD3BC\uCCD0 \uD06C\uAC8C \uAC70\uB450\uB294 \uB0A8\uAD81\uAC00\uC758 \uC911\uAE09 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "changgung-gicho-sword", minSeong: 3 }]
      },
      {
        id: "namgung-seomnoe-sword",
        name: "\uC12C\uB8B0\uAC80",
        hanjaName: "\u9583\u96F7\u528D",
        description: "\uBC88\uAC1C \uD55C \uC904\uAE30\uAC00 \uC2A4\uCE58\uB4EF \uBE60\uB978 \uB0A8\uAD81\uAC00\uC758 \uCF8C\uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "changgung-gicho-sword", minSeong: 4 }]
      },
      {
        id: "namgung-geomga-palsik",
        name: "\uAC80\uAC00\uD314\uC2DD",
        hanjaName: "\u528D\u5BB6\u516B\u5F0F",
        description: "\uB0A8\uAD81 \uAC80\uAC00\uC758 \uAE30\uBCF8 \uC5EC\uB35F \uC2DD. \uBAA8\uB4E0 \uAC00\uC804 \uAC80\uC758 \uBF08\uB300.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "namgung-geomga-gicho-sword", minSeong: 3 }]
      },
      {
        id: "namgung-cheonpung-sword",
        name: "\uCC9C\uD48D\uAC80",
        hanjaName: "\u5929\u98A8\u528D",
        description: "\uD558\uB298\uBC14\uB78C\uCC98\uB7FC \uB9C9\uD798\uC5C6\uC774 \uC774\uC5B4\uC9C0\uB294 \uB0A8\uAD81\uAC00\uC758 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "namgung-geomga-gicho-sword", minSeong: 4 }]
      },
      {
        id: "namgung-changcheon-sword",
        name: "\uCC3D\uCC9C\uAC80\uBC95",
        hanjaName: "\u84BC\u5929\u528D\u6CD5",
        description: "\uD478\uB978 \uD558\uB298\uC744 \uADF8\uB300\uB85C \uBCA0\uC5B4 \uB0B4\uB9B0 \uB4EF \uC2DC\uC6D0\uD55C \uB0A8\uAD81\uAC00\uC758 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "namgung-cheongcheon-sword", minSeong: 3 }]
      },
      {
        id: "namgung-hoecheon-sword",
        name: "\uD68C\uCC9C\uAC80",
        hanjaName: "\u56DE\u5929\u528D",
        description: "\uAE30\uC6B8\uC5B4\uC9C4 \uD615\uC138\uB97C \uD55C \uAC80\uC5D0 \uB418\uB3CC\uB9B0\uB2E4\uB294 \uB0A8\uAD81\uAC00\uC758 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "namgung-cheongcheon-sword", minSeong: 4 }]
      },
      {
        id: "changgung-muae-sword",
        name: "\uCC3D\uAD81\uBB34\uC560\uAC80\uBC95",
        hanjaName: "\u84BC\u7A79\u7121\u6DAF\u528D\u6CD5",
        description: "\uAC00\uC5C6\uB294 \uD558\uB298\uCC98\uB7FC \uAC70\uCE68\uC5C6\uB294 \uB0A8\uAD81\uAC00\uC758 \uBCF8\uC804 \uAC80\uBC95.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "changgung-gicho-sword", minSeong: 5 }]
      },
      {
        id: "seomjeon-13-geomroe",
        name: "\uC12C\uC804\uC2ED\uC0BC\uAC80\uB8B0",
        hanjaName: "\u9583\u96FB\u5341\u4E09\u528D\u96F7",
        description: "\uBC88\uAC1C \uC5F4\uC14B\uC774 \uB0B4\uB9AC\uAF42\uD788\uB294 \uB0A8\uAD81\uAC00\uC758 \uB1CC\uC804 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "changgung-muae-sword", minSeong: 5 }]
      },
      {
        id: "namgung-changcheon-singeom",
        name: "\uCC3D\uCC9C\uC2E0\uAC80",
        hanjaName: "\u84BC\u5929\u795E\u528D",
        description: "\uCC3D\uCC9C\uC758 \uAE30\uC138\uAC00 \uAC80\uB05D\uC5D0 \uAC15\uAE30\uB85C \uB9FA\uD788\uB294 \uB0A8\uAD81\uAC00\uC758 \uC0C1\uC2B9 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "namgung-changcheon-sword", minSeong: 5 }]
      },
      {
        id: "namgung-geomga-sibigeom",
        name: "\uAC80\uAC00\uC2ED\uC774\uAC80",
        hanjaName: "\u528D\u5BB6\u5341\u4E8C\u528D",
        description: "\uC5EC\uB35F \uC2DD\uC774 \uC5F4\uB450 \uAC80\uC73C\uB85C \uD53C\uC5B4\uB098\uB294 \uB0A8\uAD81 \uAC80\uAC00\uC758 \uC0C1\uC2B9 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "namgung-geomga-palsik", minSeong: 5 }]
      },
      {
        id: "jewang-geomhyeong",
        name: "\uC81C\uC655\uAC80\uD615",
        hanjaName: "\u5E1D\u738B\u528D\u5F62",
        description: "\uD558\uB298 \uC544\uB798 \uAD70\uB9BC\uD558\uB294 \uC81C\uC655\uC758 \uAC80. \uB0A8\uAD81 \uAC00\uC8FC \uC77C\uC778\uC804\uC2B9\uC758 \uC815\uC810.",
        school: "sword",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [
          { artId: "changgung-muae-sword", minSeong: 6 },
          { artId: "seomjeon-13-geomroe", minSeong: 5 }
        ]
      },
      {
        id: "namgung-daecheongang-sword",
        name: "\uB300\uCC9C\uAC15\uAC80",
        hanjaName: "\u5927\u5929\u7F61\u528D",
        description: "\uCC3D\uCC9C\uACFC \uAC80\uAC00 \uB450 \uC904\uAE30\uAC00 \uD569\uCCD0\uC838 \uD558\uB298\uC758 \uAC15\uAE30\uB97C \uB0B4\uB9AC\uAE0B\uB294 \uB0A8\uAD81 \uBE44\uC804.",
        school: "sword",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [
          { artId: "namgung-changcheon-singeom", minSeong: 6 },
          { artId: "namgung-geomga-sibigeom", minSeong: 5 }
        ]
      },
      {
        id: "namgung-cheonroe-ilseom-sword",
        name: "\uCC9C\uB8B0\uC77C\uC12C\uAC80",
        hanjaName: "\u5929\u96F7\u4E00\u9583\u528D",
        description: "\uC5F4\uC138 \uC904\uAE30 \uBC88\uAC1C\uAC00 \uB05D\uB0B4 \uD55C \uC12C\uAD11\uC73C\uB85C \uBAA8\uC774\uB294 \uB0A8\uAD81 \uB1CC\uC804 \uAC80\uC758 \uB05D.",
        school: "sword",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "seomjeon-13-geomroe", minSeong: 7 }]
      },
      // ─── 심법(qigong) 6권 — 창궁 정종 + 천뢰 보조 ───
      {
        id: "namgung-changgung-simgyeol",
        name: "\uCC3D\uAD81\uC2EC\uACB0",
        hanjaName: "\u84BC\u7A79\u5FC3\u8A23",
        description: "\uD478\uB978 \uD558\uB298\uC744 \uAC00\uC2B4\uC5D0 \uB2F4\uB294 \uB0A8\uAD81\uAC00\uC758 \uAE30\uCD08 \uAD6C\uACB0.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest"
      },
      {
        id: "namgung-cheongcheon-gigong",
        name: "\uCCAD\uCC9C\uAE30\uACF5",
        hanjaName: "\u9751\u5929\u6C23\u529F",
        description: "\uB9D1\uC740 \uAE30\uC6B4\uC774 \uC704\uB85C \uACE7\uAC8C \uC624\uB974\uB294 \uB0A8\uAD81\uAC00\uC758 \uAE30\uCD08 \uAE30\uACF5.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "namgung-changgung-simgyeol", minSeong: 3 }]
      },
      {
        id: "changgung-daeyeon-singong",
        name: "\uCC3D\uAD81\uB300\uC5F0\uC2E0\uACF5",
        hanjaName: "\u84BC\u7A79\u5927\u884D\u795E\u529F",
        description: "\uB9D1\uACE0 \uD478\uB978 \uB0B4\uB825\uC744 \uC313\uB294 \uB0A8\uAD81\uAC00\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest"
      },
      {
        id: "namgung-cheonroe-simbeop",
        name: "\uCC9C\uB8B0\uC2EC\uBC95",
        hanjaName: "\u5929\u96F7\u5FC3\u6CD5",
        description: "\uB2E8\uC804\uC5D0 \uC6B0\uB808\uB97C \uC7AC\uC6CC \uB450\uB294 \uB0A8\uAD81\uAC00\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "namgung-changgung-simgyeol", minSeong: 4 }]
      },
      {
        id: "namgung-changgung-gangki",
        name: "\uCC3D\uAD81\uAC15\uAE30",
        hanjaName: "\u84BC\u7A79\u7F61\u6C23",
        description: "\uD478\uB978 \uAC15\uAE30\uAC00 \uAC80\uACFC \uBAB8\uC744 \uD568\uAED8 \uB450\uB974\uB294 \uB0A8\uAD81\uAC00\uC758 \uC0C1\uC2B9 \uC2EC\uBC95.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "changgung-daeyeon-singong", minSeong: 5 }]
      },
      {
        id: "namgung-jewang-singong",
        name: "\uC81C\uC655\uC2E0\uACF5",
        hanjaName: "\u5E1D\u738B\u795E\u529F",
        description: "\uD558\uB298\uACFC \uC6B0\uB808\uB97C \uC544\uC6B8\uB7EC \uAC70\uB290\uB9AC\uB294 \uB0A8\uAD81 \uAC00\uC8FC \uC804\uC2B9\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [
          { artId: "namgung-changgung-gangki", minSeong: 6 },
          { artId: "namgung-cheonroe-simbeop", minSeong: 4 }
        ]
      },
      // ─── 권(fist) 5권 — 천뢰 장법 줄기 ───
      {
        id: "namgung-geomga-janggwon",
        name: "\uAC80\uAC00\uC7A5\uAD8C",
        hanjaName: "\u528D\u5BB6\u9577\u62F3",
        description: "\uAC80\uC744 \uC7A1\uAE30 \uC804 \uBAB8\uC758 \uACB0\uBD80\uD130 \uB2E6\uB294 \uB0A8\uAD81\uAC00\uC758 \uAE30\uCD08 \uAD8C\uBC95.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest"
      },
      {
        id: "cheonroe-samjang",
        name: "\uCC9C\uB8B0\uC0BC\uC7A5",
        hanjaName: "\u5929\u96F7\u4E09\u638C",
        description: "\uC138 \uBC88\uC758 \uC6B0\uB808\uAC00 \uC5F0\uC774\uC5B4 \uB5A8\uC5B4\uC9C0\uB294 \uB0A8\uAD81\uAC00\uC758 \uC7A5\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest"
      },
      {
        id: "namgung-goengnoe-jang",
        name: "\uAD49\uB8B0\uC7A5",
        hanjaName: "\u8F5F\u96F7\u638C",
        description: "\uB545\uC744 \uC6B8\uB9AC\uB294 \uC6B0\uB808\uCC98\uB7FC \uBB35\uC9C1\uD558\uAC8C \uB5A8\uC5B4\uC9C0\uB294 \uB0A8\uAD81\uAC00\uC758 \uC7A5\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "namgung-geomga-janggwon", minSeong: 3 }]
      },
      {
        id: "namgung-byeokryeok-sinjang",
        name: "\uBCBD\uB825\uC2E0\uC7A5",
        hanjaName: "\u9739\u9742\u795E\u638C",
        description: "\uC138 \uBC88\uC758 \uC6B0\uB808\uAC00 \uD55C \uBCBC\uB77D\uC73C\uB85C \uD569\uCCD0\uC9C0\uB294 \uB0A8\uAD81\uAC00\uC758 \uC0C1\uC2B9 \uC7A5\uBC95.",
        school: "fist",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "cheonroe-samjang", minSeong: 5 }]
      },
      {
        id: "namgung-goengcheon-jang",
        name: "\uAD49\uCC9C\uC7A5",
        hanjaName: "\u8F5F\u5929\u638C",
        description: "\uD558\uB298\uC744 \uC6B8\uB9B0\uB2E4\uB294 \uB0A8\uAD81\uAC00\uC758 \uC0C1\uC2B9 \uC7A5\uBC95. \uC7A5\uC138\uAC00 \uD06C\uACE0 \uAC70\uCE68\uC5C6\uB2E4.",
        school: "fist",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "namgung-goengnoe-jang", minSeong: 5 }]
      },
      // ─── 보법(lightness) 3권 — 창궁보 → 비천보 → 어천신법 ───
      {
        id: "namgung-changgung-bo",
        name: "\uCC3D\uAD81\uBCF4",
        hanjaName: "\u84BC\u7A79\u6B65",
        description: "\uD558\uB298\uC744 \uC6B0\uB7EC\uB974\uB4EF \uD5C8\uB9AC\uB97C \uD3B4\uACE0 \uD06C\uAC8C \uB0B4\uB51B\uB294 \uB0A8\uAD81\uAC00\uC758 \uBCF4\uBC95.",
        school: "lightness",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "namgung-bicheon-bo",
        name: "\uBE44\uCC9C\uBCF4",
        hanjaName: "\u98DB\u5929\u6B65",
        description: "\uD558\uB298\uB85C \uB0A0\uC544\uC624\uB97C \uB4EF \uB192\uC774 \uC19F\uAD6C\uCE58\uB294 \uB0A8\uAD81\uAC00\uC758 \uACBD\uACF5.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "namgung-changgung-bo", minSeong: 3 }]
      },
      {
        id: "namgung-eocheon-sinbeop",
        name: "\uC5B4\uCC9C\uC2E0\uBC95",
        hanjaName: "\u5FA1\u5929\u8EAB\u6CD5",
        description: "\uD558\uB298\uC744 \uBD80\uB9AC\uB4EF \uD5C8\uACF5\uC5D0\uC11C \uBC29\uD5A5\uC744 \uBC14\uAFB8\uB294 \uB0A8\uAD81 \uC2E0\uBC95\uC758 \uC815\uC218.",
        school: "lightness",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "namgung",
        acquisition: "quest",
        prerequisites: [{ artId: "namgung-bicheon-bo", minSeong: 5 }]
      }
    ];
  }
});

// src/data/martialArts/catalog/dangga.ts
var DANGGA_ARTS;
var init_dangga = __esm({
  "src/data/martialArts/catalog/dangga.ts"() {
    "use strict";
    DANGGA_ARTS = [
      // ─── 암기(hidden) 16권 — 표창·침 두 줄기가 꽃비에서 만난다 ───
      {
        id: "bipyo-sul",
        name: "\uBE44\uD45C\uC220",
        hanjaName: "\u98DB\u93E2\u8853",
        description: "\uB2F9\uAC00 \uC544\uC774\uB4E4\uC774 \uCC98\uC74C \uC190\uC5D0 \uC950\uB294 \uD45C\uCC3D \uB358\uC9C0\uAE30.",
        school: "hidden",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest"
      },
      {
        id: "dangga-bichim-sul",
        name: "\uBE44\uCE68\uC220",
        hanjaName: "\u98DB\u91DD\u8853",
        description: "\uC300\uC54C\uB9CC \uD55C \uCE68\uC744 \uB0A0\uB9AC\uB294 \uB2F9\uAC00\uC758 \uAE30\uCD08 \uC218\uBC95. \uBCF4\uC774\uC9C0 \uC54A\uC73C\uB2C8 \uB9C9\uC9C0 \uBABB\uD55C\uB2E4.",
        school: "hidden",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest"
      },
      {
        id: "dangga-chuhon-pyo",
        name: "\uCD94\uD63C\uD45C",
        hanjaName: "\u8FFD\u9B42\u93E2",
        description: "\uD63C\uC744 \uCAD3\uB294\uB2E4\uB294 \uC774\uB984\uC758 \uD45C\uCC3D \u2014 \uB358\uC9C4 \uB4A4\uC5D0\uB3C4 \uB05D\uAE4C\uC9C0 \uAE09\uC18C\uB97C \uBB38\uB2E4.",
        school: "hidden",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "bipyo-sul", minSeong: 3 }]
      },
      {
        id: "cheonnyeo-sanhwa",
        name: "\uCC9C\uB140\uC0B0\uD654",
        hanjaName: "\u5929\u5973\u6563\u82B1",
        description: "\uC120\uB140\uAC00 \uAF43\uC744 \uBFCC\uB9AC\uB4EF \uC554\uAE30\uB97C \uD769\uB294 \uB2F9\uAC00\uC758 \uC218\uBC95.",
        school: "hidden",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "bipyo-sul", minSeong: 3 }]
      },
      {
        id: "dangga-yeonhwan-pyo",
        name: "\uC5F0\uD658\uD45C",
        hanjaName: "\u9023\u74B0\u93E2",
        description: "\uD55C \uC190\uC5D0 \uC787\uB530\uB77C \uC138 \uBC1C \u2014 \uACE0\uB9AC\uCC98\uB7FC \uC774\uC5B4\uC838 \uB04A\uC774\uC9C0 \uC54A\uB294 \uB2F9\uAC00\uC758 \uD45C\uCC3D\uC220.",
        school: "hidden",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "bipyo-sul", minSeong: 4 }]
      },
      {
        id: "dangga-dokjillyeo-sul",
        name: "\uB3C5\uC9C8\uB824\uC220",
        hanjaName: "\u6BD2\u84BA\u85DC\u8853",
        description: "\uB3C5 \uBC14\uB978 \uB9C8\uB984\uC1E0\uB97C \uD769\uC5B4 \uC801\uC758 \uAE38\uBD80\uD130 \uB04A\uB294 \uB2F9\uAC00\uC758 \uC218\uBC95.",
        school: "hidden",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "dangga-bichim-sul", minSeong: 3 }]
      },
      {
        id: "dangga-chwiu-chim",
        name: "\uCDE8\uC6B0\uCE68",
        hanjaName: "\u9A5F\u96E8\u91DD",
        description: "\uC18C\uB098\uAE30\uCC98\uB7FC \uC3DF\uC544\uC9C0\uB294 \uC794\uCE68 \u2014 \uD53C\uD560 \uC790\uB9AC\uBD80\uD130 \uC5C6\uC564\uB2E4.",
        school: "hidden",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "dangga-bichim-sul", minSeong: 4 }]
      },
      {
        id: "dangga-nakhwa-pyo",
        name: "\uB099\uD654\uD45C",
        hanjaName: "\u843D\u82B1\u93E2",
        description: "\uC9C0\uB294 \uAF43\uC78E\uCC98\uB7FC \uB098\uD480\uAC70\uB9AC\uB2E4 \uC5B4\uB290\uC0C8 \uAE09\uC18C\uC5D0 \uAF42\uD788\uB294 \uB2F9\uAC00\uC758 \uD45C\uCC3D.",
        school: "hidden",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "dangga-chuhon-pyo", minSeong: 3 }]
      },
      {
        id: "dangga-bihwangseok",
        name: "\uBE44\uD669\uC11D",
        hanjaName: "\u98DB\u8757\u77F3",
        description: "\uBA54\uB69C\uAE30 \uB5BC\uCC98\uB7FC \uB0A0\uC544\uB4DC\uB294 \uB3CC\uD314\uB9E4 \u2014 \uB3CC\uBA69\uC774\uC870\uCC28 \uB2F9\uAC00 \uC190\uC5D0\uC120 \uC554\uAE30\uB2E4.",
        school: "hidden",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "dangga-chuhon-pyo", minSeong: 4 }]
      },
      {
        id: "mancheon-hwawu",
        name: "\uB9CC\uCC9C\uD654\uC6B0",
        hanjaName: "\u6EFF\u5929\u82B1\u96E8",
        description: "\uD558\uB298 \uAC00\uB4DD \uAF43\uBE44\uAC00 \uB0B4\uB9B0\uB2E4 \u2014 \uBAA8\uB4E0 \uBC29\uC704\uB97C \uC2DC\uAC04\uCC28\uB85C \uB36E\uB294 \uB2F9\uAC00\uC758 \uC808\uAE30.",
        school: "hidden",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "cheonnyeo-sanhwa", minSeong: 5 }],
        traits: ["sweep", "poison"]
        // 만방을 덮는 독 암기 — 광역 + 중독(당가 비전).
      },
      {
        id: "manryu-gwijong",
        name: "\uB9CC\uB958\uADC0\uC885",
        hanjaName: "\u842C\u6D41\u6B78\u5B97",
        description: "\uD769\uC5B4\uC9C4 \uC554\uAE30\uAC00 \uBAA8\uB450 \uC190\uC73C\uB85C \uB3CC\uC544\uC628\uB2E4 \u2014 \uB2F9\uAC00 \uCD5C\uACE0\uC758 \uD68C\uC218\uBC95.",
        school: "hidden",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "cheonnyeo-sanhwa", minSeong: 5 }]
      },
      {
        id: "dangga-dokryong-pyo",
        name: "\uB3C5\uB8E1\uD45C",
        hanjaName: "\u6BD2\u9F8D\u93E2",
        description: "\uB3C5\uC744 \uBA38\uAE08\uC740 \uC6A9\uCC98\uB7FC \uAD7D\uC774\uCCD0 \uB0A0\uC544\uAC00\uB294 \uB2F9\uAC00\uC758 \uC0C1\uC2B9 \uD45C\uCC3D\uC220.",
        school: "hidden",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "dangga-yeonhwan-pyo", minSeong: 5 }]
      },
      {
        id: "dangga-bihwa-sinchim",
        name: "\uBE44\uD654\uC2E0\uCE68",
        hanjaName: "\u98DB\u82B1\u795E\u91DD",
        description: "\uAF43\uC78E \uC0AC\uC774\uC5D0 \uCE68\uC744 \uC228\uACA8 \uB0A0\uB9AC\uB294 \uB2F9\uAC00\uC758 \uC0C1\uC2B9 \uCE68\uC220.",
        school: "hidden",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "dangga-chwiu-chim", minSeong: 5 }]
      },
      {
        id: "pokwu-ihwa-chim",
        name: "\uD3ED\uC6B0\uC774\uD654\uCE68",
        hanjaName: "\u66B4\u96E8\u68A8\u82B1\u91DD",
        description: "\uD3ED\uC6B0\uCC98\uB7FC \uC3DF\uC544\uC9C0\uB294 \uB3C5\uCE68. \uB2F9\uAC00 \uBE44\uC804\uC758 \uB3C5\uBB38 \uC554\uAE30.",
        school: "hidden",
        grade: "grandmaster",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [
          { artId: "mancheon-hwawu", minSeong: 6 },
          { artId: "manryu-gwijong", minSeong: 4 }
        ]
      },
      {
        id: "dangga-cheondok-hwawu",
        name: "\uCC9C\uB3C5\uD654\uC6B0",
        hanjaName: "\u5343\u6BD2\u82B1\u96E8",
        description: "\uCC9C \uAC00\uC9C0 \uB3C5\uC774 \uAF43\uBE44\uC5D0 \uC2E4\uB824 \uB0B4\uB9AC\uB294 \uB2F9\uAC00 \uC554\uAE30\uC758 \uB610 \uB2E4\uB978 \uC815\uC810.",
        school: "hidden",
        grade: "grandmaster",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [
          { artId: "dangga-dokryong-pyo", minSeong: 6 },
          { artId: "dangga-bihwa-sinchim", minSeong: 5 }
        ]
      },
      {
        id: "dangga-muhyeong-chim",
        name: "\uBB34\uD615\uCE68",
        hanjaName: "\u7121\u5F62\u91DD",
        description: "\uD615\uCCB4\uB3C4 \uADF8\uB9BC\uC790\uB3C4 \uC5C6\uB294 \uCE68 \u2014 \uB9DE\uC740 \uC904\uB3C4 \uBAA8\uB974\uAC8C \uB05D\uB09C\uB2E4.",
        school: "hidden",
        grade: "grandmaster",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "mancheon-hwawu", minSeong: 7 }]
      },
      // ─── 권(fist) 6권 — 독장 계열, 청독수에서 만독수까지 ───
      {
        id: "dangga-cheongdok-su",
        name: "\uCCAD\uB3C5\uC218",
        hanjaName: "\u9751\u6BD2\u624B",
        description: "\uD478\uB974\uC2A4\uB984\uD55C \uB3C5\uAE30\uAC00 \uC190\uB05D\uC5D0 \uC5B4\uB9AC\uB294 \uB2F9\uAC00 \uB3C5\uACF5\uC758 \uCCAB\uAC78\uC74C.",
        school: "fist",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest"
      },
      {
        id: "doksa-jang",
        name: "\uB3C5\uC0AC\uC7A5",
        hanjaName: "\u6BD2\u7802\u638C",
        description: "\uB3C5 \uBAA8\uB798\uB97C \uBA39\uC778 \uC190\uC73C\uB85C \uCE58\uB294 \uB2F9\uAC00\uC758 \uC7A5\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest"
      },
      {
        id: "dangga-chwidok-jang",
        name: "\uCDE8\uB3C5\uC7A5",
        hanjaName: "\u805A\u6BD2\u638C",
        description: "\uC190\uBC14\uB2E5\uC5D0 \uB3C5\uAE30\uB97C \uBAA8\uC544 \uCE58\uB294 \uB2F9\uAC00\uC758 \uC911\uAE09 \uC7A5\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "dangga-cheongdok-su", minSeong: 3 }]
      },
      {
        id: "dangga-odok-jang",
        name: "\uC624\uB3C5\uC7A5",
        hanjaName: "\u4E94\u6BD2\u638C",
        description: "\uB2E4\uC12F \uAC00\uC9C0 \uB3C5\uC744 \uD55C \uC190\uC5D0 \uAC08\uBB34\uB9AC\uD55C \uB2F9\uAC00\uC758 \uC0C1\uC2B9 \uC7A5\uBC95.",
        school: "fist",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "doksa-jang", minSeong: 5 }]
      },
      {
        id: "dangga-bugol-jang",
        name: "\uBD80\uACE8\uC7A5",
        hanjaName: "\u8150\u9AA8\u638C",
        description: "\uC2A4\uCE5C \uC790\uB9AC\uC758 \uBF08\uAC00 \uC0AD\uB294\uB2E4\uB294 \uB2F9\uAC00\uC758 \uC74C\uB3C5\uD55C \uC7A5\uBC95.",
        school: "fist",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "dangga-chwidok-jang", minSeong: 5 }]
      },
      {
        id: "dangga-mandok-su",
        name: "\uB9CC\uB3C5\uC218",
        hanjaName: "\u842C\u6BD2\u624B",
        description: "\uB9CC \uAC00\uC9C0 \uB3C5\uC774 \uD55C \uC190\uC5D0 \uBAA8\uC774\uB294 \uB2F9\uAC00 \uB3C5\uACF5\uC758 \uC815\uC810.",
        school: "fist",
        grade: "grandmaster",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [
          { artId: "dangga-odok-jang", minSeong: 6 },
          { artId: "dangga-bugol-jang", minSeong: 5 }
        ]
      },
      // ─── 심법(qigong) 4권 — 어독에서 천독신공까지 ───
      {
        id: "dangga-eodok-simgyeol",
        name: "\uC5B4\uB3C5\uC2EC\uACB0",
        hanjaName: "\u5FA1\u6BD2\u5FC3\u8A23",
        description: "\uB3C5\uC744 \uB204\uB974\uACE0 \uBD80\uB9AC\uB294 \uB2F9\uAC00 \uB0B4\uACF5\uC758 \uCCAB \uAD6C\uACB0.",
        school: "qigong",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest"
      },
      {
        id: "dangga-hosim-gigong",
        name: "\uD638\uC2EC\uAE30\uACF5",
        hanjaName: "\u8B77\u5FC3\u6C23\u529F",
        description: "\uC2EC\uB9E5\uC744 \uB3C5\uAE30\uB85C\uBD80\uD130 \uC9C0\uD0A4\uB294 \uB2F9\uAC00\uC758 \uAE30\uCD08 \uAE30\uACF5.",
        school: "qigong",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "dangga-eodok-simgyeol", minSeong: 3 }]
      },
      {
        id: "dangga-baekdok-bulchim-gong",
        name: "\uBC31\uB3C5\uBD88\uCE68\uACF5",
        hanjaName: "\u767E\u6BD2\u4E0D\u4FB5\u529F",
        description: "\uBC31 \uAC00\uC9C0 \uB3C5\uC774 \uCE68\uBC94\uD558\uC9C0 \uBABB\uD558\uB294 \uBAB8\uC744 \uB9CC\uB4DC\uB294 \uB2F9\uAC00\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "dangga-eodok-simgyeol", minSeong: 4 }]
      },
      {
        id: "dangga-cheondok-singong",
        name: "\uCC9C\uB3C5\uC2E0\uACF5",
        hanjaName: "\u5343\u6BD2\u795E\u529F",
        description: "\uB3C5\uC73C\uB85C \uB0B4\uB825\uC744 \uAE30\uB974\uB294 \uB2F9\uAC00 \uBE44\uC804 \uC2EC\uBC95. \uB3C5\uC774 \uACE7 \uD798\uC774 \uB41C\uB2E4.",
        school: "qigong",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "dangga-baekdok-bulchim-gong", minSeong: 5 }]
      },
      // ─── 보법(lightness) 2권 — 그림자 걸음 ───
      {
        id: "dangga-amyeong-bo",
        name: "\uC554\uC601\uBCF4",
        hanjaName: "\u6697\u5F71\u6B65",
        description: "\uADF8\uB9BC\uC790\uC5D0 \uBAB8\uC744 \uBD99\uC5EC \uC790\uB9AC\uB97C \uC62E\uAE30\uB294 \uB2F9\uAC00\uC758 \uBCF4\uBC95.",
        school: "lightness",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "dangga-museong-bo",
        name: "\uBB34\uC131\uBCF4",
        hanjaName: "\u7121\u8072\u6B65",
        description: "\uBC1C\uC18C\uB9AC\uAC00 \uC8FD\uB294 \uAC78\uC74C \u2014 \uC554\uAE30\uB97C \uB0A0\uB9B4 \uC790\uB9AC\uAE4C\uC9C0 \uC18C\uB9AC \uC5C6\uC774 \uB2FF\uB294\uB2E4.",
        school: "lightness",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "dangga-amyeong-bo", minSeong: 3 }]
      },
      // ─── 의술(medical) 2권 — 용독·해독 ───
      {
        id: "dangga-yongdok-sul",
        name: "\uC6A9\uB3C5\uC220",
        hanjaName: "\u7528\u6BD2\u8853",
        description: "\uB3C5\uC758 \uC131\uC9C8\uACFC \uC4F0\uC784\uC744 \uAC00\uB974\uB294 \uB2F9\uAC00\uC758 \uAE30\uCD08 \uC6A9\uB3C5\uC220.",
        school: "medical",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "dangga-eodok-simgyeol", minSeong: 3 }]
      },
      {
        id: "dangga-haedok-bigyeol",
        name: "\uD574\uB3C5\uBE44\uACB0",
        hanjaName: "\u89E3\u6BD2\u7955\u8A23",
        description: "\uB3C5\uC744 \uC544\uB294 \uC790\uB9CC\uC774 \uB3C5\uC744 \uD47C\uB2E4 \u2014 \uB2F9\uAC00\uC758 \uD574\uB3C5 \uBE44\uC804.",
        school: "medical",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "dangga",
        acquisition: "quest",
        prerequisites: [{ artId: "dangga-yongdok-sul", minSeong: 5 }]
      }
    ];
  }
});

// src/data/martialArts/catalog/paengga.ts
var PAENGGA_ARTS;
var init_paengga = __esm({
  "src/data/martialArts/catalog/paengga.ts"() {
    "use strict";
    PAENGGA_ARTS = [
      // ─── 도(saber) 16 — 호랑이와 벼락의 칼 ──────────────────────────────────
      {
        id: "paengga-gicho-do",
        name: "\uD33D\uAC00\uAE30\uCD08\uB3C4",
        hanjaName: "\u5F6D\u5BB6\u57FA\u790E\u5200",
        description: "\uD558\uBD81 \uD33D\uAC00 \uC544\uC774\uB4E4\uC774 \uCC98\uC74C \uC950\uB294 \uB3C4. \uBB34\uAC81\uAC8C \uC7A1\uACE0 \uD06C\uAC8C \uBCA0\uB294 \uBC95\uBD80\uD130 \uAC00\uB974\uCE5C\uB2E4.",
        school: "saber",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest"
      },
      {
        id: "paengga-maengho-do",
        name: "\uB9F9\uD638\uB3C4\uBC95",
        hanjaName: "\u731B\u864E\u5200\u6CD5",
        description: "\uC0AC\uB098\uC6B4 \uD638\uB791\uC774\uAC00 \uBA39\uC774\uB97C \uB36E\uCE58\uB4EF \uC704\uC5D0\uC11C \uB0B4\uB9AC\uCC0D\uB294 \uD33D\uAC00\uC758 \uC785\uBB38 \uB3C4\uBC95.",
        school: "saber",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "paengga-gicho-do", minSeong: 2 }]
      },
      {
        id: "paengga-byeoksan-do",
        name: "\uBCBD\uC0B0\uB3C4\uBC95",
        hanjaName: "\u5288\u5C71\u5200\u6CD5",
        description: "\uC0B0\uC744 \uCABC\uAC20\uB2E4\uB294 \uAE30\uC138\uB85C \uD55C \uAE38\uB85C\uB9CC \uB0B4\uB9AC\uAE0B\uB294 \uD33D\uAC00\uC758 \uAE30\uCD08 \uB3C4\uBC95.",
        school: "saber",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "paengga-gicho-do", minSeong: 2 }]
      },
      {
        id: "ohodanmun-do",
        name: "\uC624\uD638\uB2E8\uBB38\uB3C4",
        hanjaName: "\u4E94\u864E\u65B7\u9580\u5200",
        description: "\uB2E4\uC12F \uD638\uB791\uC774\uAC00 \uBB38\uC744 \uBD80\uC218\uB4EF \uB0B4\uB9AC\uCC0D\uB294 \uD33D\uAC00\uC758 \uBFCC\uB9AC \uB3C4\uBC95.",
        school: "saber",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest"
      },
      {
        id: "paengga-noeseong-do",
        name: "\uB1CC\uC131\uB3C4",
        hanjaName: "\u96F7\u8072\u5200",
        description: "\uC6B0\uB808 \uC18C\uB9AC\uAC00 \uCE7C\uB05D\uBCF4\uB2E4 \uBA3C\uC800 \uB2FF\uB294\uB2E4\uB294 \uD33D\uAC00\uC758 \uC911\uAE09 \uB3C4\uBC95.",
        school: "saber",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "paengga-gicho-do", minSeong: 4 }]
      },
      {
        id: "paengga-hopo-do",
        name: "\uD638\uD3EC\uB3C4\uBC95",
        hanjaName: "\u864E\u5486\u5200\u6CD5",
        description: "\uD638\uB791\uC774 \uC6B8\uC74C\uC73C\uB85C \uAE30\uC138\uBD80\uD130 \uB204\uB974\uACE0 \uC9D3\uCCD0\uB4DC\uB294 \uD33D\uAC00\uC758 \uC911\uAE09 \uB3C4\uBC95.",
        school: "saber",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "paengga-maengho-do", minSeong: 3 }]
      },
      {
        id: "paengga-maengho-chullim-do",
        name: "\uB9F9\uD638\uCD9C\uB9BC\uB3C4",
        hanjaName: "\u731B\u864E\u51FA\u6797\u5200",
        description: "\uC232\uC744 \uB098\uC11C\uB294 \uD638\uB791\uC774\uCC98\uB7FC \uAC70\uCE68\uC5C6\uC774 \uC55E\uC73C\uB85C\uB9CC \uB098\uC544\uAC00\uB294 \uD33D\uAC00\uC758 \uB3C4\uBC95.",
        school: "saber",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "paengga-maengho-do", minSeong: 3 }]
      },
      {
        id: "paengga-gaesan-do",
        name: "\uAC1C\uC0B0\uB3C4\uBC95",
        hanjaName: "\u958B\u5C71\u5200\u6CD5",
        description: "\uC0B0\uBB38\uC744 \uC5F4\uB4EF \uC815\uBA74\uC744 \uBD80\uC218\uACE0 \uAE38\uC744 \uB0B4\uB294 \uD33D\uAC00\uC758 \uC911\uAE09 \uB3C4\uBC95.",
        school: "saber",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "paengga-byeoksan-do", minSeong: 3 }]
      },
      {
        id: "wangja-sado",
        name: "\uC655\uC790\uC0AC\uB3C4",
        hanjaName: "\u738B\u5B57\u56DB\u5200",
        description: "\uC655(\u738B) \uC790 \uB124 \uD68D\uC744 \uAE0B\uB4EF \uBB34\uAC81\uAC8C \uBCA0\uB294 \uD33D\uAC00 \uC0C1\uC2B9 \uB3C4\uBC95.",
        school: "saber",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "ohodanmun-do", minSeong: 5 }]
      },
      {
        id: "cheolhyeol-jeokseong-do",
        name: "\uCCA0\uD608\uC801\uC131\uB3C4",
        hanjaName: "\u9435\u8840\u6458\u661F\u5200",
        description: "\uBCC4\uC744 \uB530\uB4EF \uCE58\uC19F\uB294 \uD33D\uAC00\uC758 \uBCC0\uCE59 \uB3C4\uBC95. \uC624\uD638\uB2E8\uBB38\uB3C4\uC5D0\uC11C \uAC08\uB77C\uC9C4 \uB2E4\uB978 \uAE38.",
        school: "saber",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "ohodanmun-do", minSeong: 5 }]
      },
      {
        id: "paengga-noeho-do",
        name: "\uB1CC\uD638\uB3C4\uBC95",
        hanjaName: "\u96F7\u864E\u5200\u6CD5",
        description: "\uBCBC\uB77D\uACFC \uD638\uB791\uC774, \uD33D\uAC00\uC758 \uB450 \uAE30\uC0C1\uC744 \uD55C \uCE7C\uC5D0 \uC2E4\uC740 \uC0C1\uC2B9 \uB3C4\uBC95.",
        school: "saber",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "paengga-noeseong-do", minSeong: 5 }]
      },
      {
        id: "paengga-baeksu-wang-do",
        name: "\uBC31\uC218\uC655\uB3C4",
        hanjaName: "\u767E\u7378\u738B\u5200",
        description: "\uBB47\uC9D0\uC2B9\uC758 \uC655\uC774 \uAD70\uB9BC\uD558\uB4EF \uAE30\uC138\uB9CC\uC73C\uB85C \uC801\uC9C4\uC744 \uB204\uB974\uB294 \uD33D\uAC00\uC758 \uC0C1\uC2B9 \uB3C4\uBC95.",
        school: "saber",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "paengga-hopo-do", minSeong: 5 }]
      },
      {
        id: "paengga-danak-do",
        name: "\uB2E8\uC545\uB3C4",
        hanjaName: "\u65B7\u5CB3\u5200",
        description: "\uD070 \uC0B0\uC904\uAE30\uB9C8\uC800 \uB04A\uC5B4\uB0B8\uB2E4\uB294 \uD33D\uAC00\uC758 \uBB34\uAC70\uC6B4 \uC0C1\uC2B9 \uB3C4\uBC95.",
        school: "saber",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "paengga-gaesan-do", minSeong: 5 }]
      },
      {
        id: "honwon-byeokryeok-do",
        name: "\uD63C\uC6D0\uBCBD\uB825\uB3C4",
        hanjaName: "\u6DF7\u5143\u9739\u9742\u5200",
        description: "\uBCBC\uB77D\uC774 \uB545\uC744 \uAC00\uB974\uB294 \uD33D\uAC00 \uCD5C\uACE0 \uBE44\uC804. \uD55C \uCE7C\uC5D0 \uBAA8\uB4E0 \uAC83\uC744 \uC2E3\uB294\uB2E4.",
        school: "saber",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [
          { artId: "wangja-sado", minSeong: 6 },
          { artId: "cheolhyeol-jeokseong-do", minSeong: 4 }
        ]
      },
      {
        id: "paengga-baekho-cheongang-do",
        name: "\uBC31\uD638\uCC9C\uAC15\uB3C4",
        hanjaName: "\u767D\u864E\u5929\u7F61\u5200",
        description: "\uD770 \uD638\uB791\uC774\uAC00 \uD558\uB298\uC758 \uAC15\uAE30\uB97C \uB450\uB974\uACE0 \uB0B4\uB824\uC628\uB2E4 \u2014 \uBCBC\uB77D\uACFC \uC655\uAE30\uAC00 \uB2E4\uC2DC \uB9CC\uB098\uB294 \uD33D\uAC00 \uB3C4\uBC95\uC758 \uC815\uC810.",
        school: "saber",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [
          { artId: "paengga-noeho-do", minSeong: 6 },
          { artId: "paengga-baeksu-wang-do", minSeong: 5 }
        ]
      },
      {
        id: "paengga-paewang-do",
        name: "\uD328\uC655\uB3C4\uBC95",
        hanjaName: "\u9738\u738B\u5200\u6CD5",
        description: "\uD55C \uCE7C\uC5D0 \uD328\uC790\uC758 \uC704\uC5C4\uC744 \uC2E3\uB294\uB2E4\uB294 \uD33D\uAC00 \uBE44\uC804\uC758 \uD328\uB3C4\uC801\uC778 \uB3C4\uBC95.",
        school: "saber",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "paengga-danak-do", minSeong: 7 }]
      },
      // ─── 권(fist) 6 — 박투와 장법 ───────────────────────────────────────────
      {
        id: "paengga-cheolsan-go",
        name: "\uCCA0\uC0B0\uACE0",
        hanjaName: "\u9435\u5C71\u9760",
        description: "\uBB34\uC1E0 \uC0B0\uCC98\uB7FC \uC5B4\uAE68\uB85C \uBD80\uB52A\uCCD0 \uBB34\uB108\uB728\uB9AC\uB294 \uD33D\uAC00\uC758 \uAE30\uCD08 \uBC15\uD22C.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest"
      },
      {
        id: "paengga-hojo-su",
        name: "\uD638\uC870\uC218",
        hanjaName: "\u864E\u722A\u624B",
        description: "\uD638\uB791\uC774 \uBC1C\uD1B1\uCC98\uB7FC \uC6C0\uCF1C\uC950\uACE0 \uCC22\uB294 \uD33D\uAC00\uC758 \uC190\uAE30\uC220.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "paengga-cheolsan-go", minSeong: 2 }]
      },
      {
        id: "geongon-sinjang",
        name: "\uAC74\uACE4\uC2E0\uC7A5",
        hanjaName: "\u4E7E\u5764\u795E\u638C",
        description: "\uD558\uB298\uACFC \uB545\uC744 \uAC00\uB974\uB4EF \uBB35\uC9C1\uD55C \uD33D\uAC00\uC758 \uC7A5\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest"
      },
      {
        id: "paengga-byeokryeok-jang",
        name: "\uBCBD\uB825\uC7A5",
        hanjaName: "\u9739\u9742\u638C",
        description: "\uBCBC\uB77D\uC774 \uB0B4\uB9AC\uCE58\uB4EF \uB2E8\uC228\uC5D0 \uD6C4\uB824\uCE58\uB294 \uD33D\uAC00\uC758 \uC7A5\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "paengga-hojo-su", minSeong: 3 }]
      },
      {
        id: "paengga-bokho-jang",
        name: "\uBCF5\uD638\uC7A5",
        hanjaName: "\u4F0F\u864E\u638C",
        description: "\uB0A0\uB6F0\uB294 \uD638\uB791\uC774\uB3C4 \uC5CE\uB4DC\uB9AC\uAC8C \uD55C\uB2E4\uB294 \uD33D\uAC00\uC758 \uBB35\uC9C1\uD55C \uC7A5\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "paengga-cheolsan-go", minSeong: 3 }]
      },
      {
        id: "paengga-georyeong-singwon",
        name: "\uAC70\uB839\uC2E0\uAD8C",
        hanjaName: "\u5DE8\u9748\u795E\u62F3",
        description: "\uAC70\uB839\uC2E0\uC774 \uC0B0\uC744 \uC62E\uAE30\uB4EF \uD55C \uC8FC\uBA39\uC5D0 \uCC9C\uADFC\uC758 \uD798\uC744 \uC2E3\uB294 \uD33D\uAC00 \uAD8C\uBC95\uC758 \uC815\uC218.",
        school: "fist",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "paengga-byeokryeok-jang", minSeong: 5 }]
      },
      // ─── 심법(qigong) 4 — 혼원의 기 ─────────────────────────────────────────
      {
        id: "paengga-honwon-simbeop",
        name: "\uD63C\uC6D0\uC2EC\uBC95",
        hanjaName: "\u6DF7\u5143\u5FC3\u6CD5",
        description: "\uD33D\uAC00 \uC544\uC774\uB4E4\uC774 \uB2E8\uC804\uC744 \uC7A1\uB294 \uCCAB \uC2EC\uBC95. \uAC70\uCE60\uC9C0\uB9CC \uADF8\uB987\uC774 \uD06C\uB2E4.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest"
      },
      {
        id: "paengga-honwon-ilgi-gong",
        name: "\uD63C\uC6D0\uC77C\uAE30\uACF5",
        hanjaName: "\u6DF7\u5143\u4E00\u6C23\u529F",
        description: "\uD769\uC5B4\uC9C4 \uAE30\uC6B4\uC744 \uD55C \uC904\uAE30\uB85C \uC11E\uC5B4 \uAE30\uB974\uB294 \uD33D\uAC00\uC758 \uC911\uAE09 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "paengga-honwon-simbeop", minSeong: 3 }]
      },
      {
        id: "paengga-yanggang-singong",
        name: "\uC591\uAC15\uC2E0\uACF5",
        hanjaName: "\u967D\u525B\u795E\u529F",
        description: "\uB728\uAC81\uACE0 \uAC15\uB9F9\uD55C \uC591\uC758 \uAE30\uC6B4\uB9CC\uC744 \uACE8\uB77C \uC313\uB294 \uD33D\uAC00\uC758 \uC0C1\uC2B9 \uC2EC\uBC95.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "paengga-honwon-ilgi-gong", minSeong: 5 }]
      },
      {
        id: "paengga-honwon-ganggi",
        name: "\uD63C\uC6D0\uAC15\uAE30",
        hanjaName: "\u6DF7\u5143\u7F61\u6C23",
        description: "\uC628\uBAB8\uC5D0 \uD63C\uC6D0\uC758 \uAC15\uAE30\uAC00 \uB9FA\uD600 \uCE7C\uB0A0\uC5D0 \uBCBC\uB77D\uC744 \uC2E3\uB294 \uD33D\uAC00 \uC2EC\uBC95\uC758 \uC815\uC810.",
        school: "qigong",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "paengga-yanggang-singong", minSeong: 6 }]
      },
      // ─── 외공(external) 3 — 호랑이의 몸 ─────────────────────────────────────
      {
        id: "paengga-hogol-gong",
        name: "\uD638\uACE8\uACF5",
        hanjaName: "\u864E\u9AA8\u529F",
        description: "\uBF08\uB97C \uD638\uB791\uC774\uCC98\uB7FC \uB2E8\uB2E8\uD788 \uB2E4\uC9C0\uB294 \uD33D\uAC00\uC758 \uAE30\uCD08 \uC678\uACF5.",
        school: "external",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "paengga-cheolsan-go", minSeong: 2 }]
      },
      {
        id: "paengga-cheolbae-gong",
        name: "\uCCA0\uBC30\uACF5",
        hanjaName: "\u9435\u80CC\u529F",
        description: "\uB4F1\uC73C\uB85C \uB099\uB8B0\uB3C4 \uBC1B\uC544\uB0B8\uB2E4\uB294 \uD33D\uAC00\uC758 \uC678\uACF5. \uB4F1\uC774 \uBB34\uC1E0\uCC98\uB7FC \uB2E8\uB2E8\uD574\uC9C4\uB2E4.",
        school: "external",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "paengga-hogol-gong", minSeong: 3 }]
      },
      {
        id: "paengga-dongpi-cheolgol",
        name: "\uB3D9\uD53C\uCCA0\uACE8",
        hanjaName: "\u9285\u76AE\u9435\u9AA8",
        description: "\uAD6C\uB9AC \uAC00\uC8FD\uC5D0 \uBB34\uC1E0 \uBF08 \u2014 \uAC15\uB9F9\uD55C \uB3C4\uACA9\uC744 \uB9E8\uBAB8\uC73C\uB85C \uBC1B\uC544\uB0B4\uB294 \uD33D\uAC00 \uC678\uACF5\uC758 \uC815\uC810.",
        school: "external",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "paengga-cheolbae-gong", minSeong: 5 }]
      },
      // ─── 보법(lightness) 1 ──────────────────────────────────────────────────
      {
        id: "paengga-hoyak-bo",
        name: "\uD638\uC57D\uBCF4",
        hanjaName: "\u864E\u8E8D\u6B65",
        description: "\uD638\uB791\uC774\uAC00 \uACE8\uC9DC\uAE30\uB97C \uAC74\uB108\uB6F0\uB4EF \uB2E8\uC228\uC5D0 \uAC70\uB9AC\uB97C \uC881\uD788\uB294 \uD33D\uAC00\uC758 \uBCF4\uBC95.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "paengga",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      }
    ];
  }
});

// src/data/martialArts/catalog/moyong.ts
var MOYONG_ARTS;
var init_moyong = __esm({
  "src/data/martialArts/catalog/moyong.ts"() {
    "use strict";
    MOYONG_ARTS = [
      // ─── 검(sword) 14 — 쾌검과 되돌리는 검 ──────────────────────────────────
      {
        id: "moyong-gicho-sword",
        name: "\uBAA8\uC6A9\uAE30\uCD08\uAC80",
        hanjaName: "\u6155\u5BB9\u57FA\u790E\u528D",
        description: "\uC5F0\uB098\uB77C \uC655\uAC00\uC758 \uD6C4\uC608\uB77C \uC790\uBD80\uD558\uB294 \uBAA8\uC6A9\uAC00 \uC544\uC774\uB4E4\uC758 \uC785\uBB38 \uAC80. \uBE60\uB984\uBCF4\uB2E4 \uC815\uD655\uD568\uC744 \uBA3C\uC800 \uC0C8\uAE34\uB2E4.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest"
      },
      {
        id: "moyong-chupung-sword",
        name: "\uCD94\uD48D\uAC80",
        hanjaName: "\u8FFD\u98A8\u528D",
        description: "\uBC14\uB78C\uC744 \uB4A4\uCAD3\uB4EF \uACE7\uAC8C \uB0B4\uB2EC\uB9AC\uB294 \uBAA8\uC6A9\uAC00\uC758 \uAE30\uCD08 \uCF8C\uAC80.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "moyong-gicho-sword", minSeong: 2 }]
      },
      {
        id: "moyong-yeonja-sword",
        name: "\uC5F0\uC790\uAC80",
        hanjaName: "\u71D5\u5B50\u528D",
        description: "\uC81C\uBE44\uAC00 \uBB3C\uC744 \uCC28\uB4EF \uAC00\uBCCD\uAC8C \uC2A4\uCE58\uACE0 \uBE60\uC9C0\uB294 \uBAA8\uC6A9\uAC00\uC758 \uAE30\uCD08 \uAC80.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "moyong-gicho-sword", minSeong: 2 }]
      },
      {
        id: "seomgwang-bunun-sword",
        name: "\uC12C\uAD11\uBD84\uC6B4\uAC80",
        hanjaName: "\u9583\u5149\u5206\u96F2\u528D",
        description: "\uAD6C\uB984\uC744 \uAC00\uB974\uB294 \uBE5B\uC0B4\uCC98\uB7FC \uBE60\uB978 \uBAA8\uC6A9\uAC00\uC758 \uCF8C\uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest"
      },
      {
        id: "moyong-jilroe-sword",
        name: "\uC9C8\uB8B0\uAC80",
        hanjaName: "\u75BE\u96F7\u528D",
        description: "\uADC0\uAC00 \uC6B0\uB808\uB97C \uB4E3\uAE30 \uC804\uC5D0 \uAC80\uC774 \uBA3C\uC800 \uB2FF\uB294\uB2E4\uB294 \uBAA8\uC6A9\uAC00\uC758 \uCF8C\uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "moyong-chupung-sword", minSeong: 3 }]
      },
      {
        id: "moyong-yeonhwan-kwae-sword",
        name: "\uC5F0\uD658\uCF8C\uAC80",
        hanjaName: "\u9023\u74B0\u5FEB\u528D",
        description: "\uD55C \uC218\uAC00 \uB05D\uB098\uAE30 \uC804\uC5D0 \uB2E4\uC74C \uC218\uAC00 \uC774\uC5B4\uC9C0\uB294 \uBAA8\uC6A9\uAC00\uC758 \uC5F0\uD658 \uCF8C\uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "moyong-chupung-sword", minSeong: 3 }]
      },
      {
        id: "moyong-hoeyeon-sword",
        name: "\uD68C\uC5F0\uAC80",
        hanjaName: "\u56DE\u71D5\u528D",
        description: "\uB465\uC9C0\uB85C \uB418\uB3CC\uC544\uC624\uB294 \uC81C\uBE44\uCC98\uB7FC \uBED7\uC740 \uAC80\uC774 \uD638\uC120\uC744 \uADF8\uB9AC\uBA70 \uB418\uB3CC\uC544 \uBCA0\uB294 \uBAA8\uC6A9\uAC00\uC758 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "moyong-yeonja-sword", minSeong: 3 }]
      },
      {
        id: "moyong-goso-sword",
        name: "\uACE0\uC18C\uAC80\uBC95",
        hanjaName: "\u59D1\u8607\u528D\u6CD5",
        description: "\uBB3C\uC758 \uACE0\uC7A5 \uACE0\uC18C\uC758 \uC548\uAC1C\uCC98\uB7FC \uBD80\uB4DC\uB7FD\uAC8C \uAC10\uACBC\uB2E4 \uB9E4\uC12D\uAC8C \uB04A\uB294 \uBAA8\uC6A9\uAC00\uC758 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "moyong-gicho-sword", minSeong: 3 }]
      },
      {
        id: "geongon-paseom-sword",
        name: "\uAC74\uACE4\uD30C\uC12C\uAC80",
        hanjaName: "\u4E7E\u5764\u7834\u9583\u528D",
        description: "\uBC88\uAC1C\uB9C8\uC800 \uCABC\uAC20\uB2E4\uB294 \uBAA8\uC6A9\uAC00\uC758 \uC0C1\uC2B9 \uCF8C\uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "seomgwang-bunun-sword", minSeong: 5 }]
      },
      {
        id: "ssangyong-seonpung-sword",
        name: "\uC30D\uC6A9\uC120\uD48D\uAC80",
        hanjaName: "\u96D9\u9F8D\u65CB\u98A8\u528D",
        description: "\uB450 \uB9C8\uB9AC \uC6A9\uC774 \uD68C\uC624\uB9AC\uB97C \uC77C\uC73C\uD0A4\uB294 \uBAA8\uC6A9\uAC00\uC758 \uC30D\uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "seomgwang-bunun-sword", minSeong: 5 }]
      },
      {
        id: "moyong-yuseong-chuwol-sword",
        name: "\uC720\uC131\uCD94\uC6D4\uAC80",
        hanjaName: "\u6D41\u661F\u8FFD\u6708\u528D",
        description: "\uBCC4\uB625\uC774 \uB2EC\uC744 \uB4A4\uCAD3\uB4EF \uB2FF\uC744 \uC218 \uC5C6\uB294 \uBE60\uB984\uC744 \uC887\uB294 \uBAA8\uC6A9\uAC00\uC758 \uC0C1\uC2B9 \uCF8C\uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "moyong-jilroe-sword", minSeong: 5 }]
      },
      {
        id: "moyong-hubal-seonji-sword",
        name: "\uD6C4\uBC1C\uC120\uC9C0\uAC80",
        hanjaName: "\u5F8C\u767C\u5148\u81F3\u528D",
        description: "\uB098\uC911\uC5D0 \uBF51\uC544 \uBA3C\uC800 \uB2FF\uB294\uB2E4 \u2014 \uC0C1\uB300\uC758 \uCD08\uC2DD\uC744 \uBC1B\uC544 \uB418\uB3CC\uB9AC\uB294 \uBAA8\uC6A9\uAC00\uC758 \uC0C1\uC2B9 \uAC80\uB9AC.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "moyong-yeonhwan-kwae-sword", minSeong: 5 }]
      },
      {
        id: "moyong-goso-yeonu-sword",
        name: "\uACE0\uC18C\uC5F0\uC6B0\uAC80",
        hanjaName: "\u59D1\u8607\u7159\u96E8\u528D",
        description: "\uACE0\uC18C\uC758 \uC548\uAC1C\uBE44\uCC98\uB7FC \uC790\uC6B1\uD558\uAC8C \uB36E\uC5B4 \uC0C1\uB300\uC758 \uBE48\uD2C8\uC744 \uC9C0\uC6B0\uB294 \uBAA8\uC6A9\uAC00\uC758 \uC0C1\uC2B9 \uAC80.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "moyong-goso-sword", minSeong: 5 }]
      },
      {
        id: "moyong-hoecheon-seomyeong-sword",
        name: "\uD68C\uCC9C\uC12C\uC601\uAC80",
        hanjaName: "\u56DE\u5929\u9583\u5F71\u528D",
        description: "\uD558\uB298\uB9C8\uC800 \uB418\uB3CC\uB9B0\uB2E4\uB294 \uBAA8\uC6A9\uAC00 \uAC80\uD559\uC758 \uC815\uC810. \uBE60\uB984\uACFC \uB418\uB3CC\uB9BC\uC774 \uD55C \uAC80\uC5D0 \uBAA8\uC778\uB2E4.",
        school: "sword",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [
          { artId: "moyong-yuseong-chuwol-sword", minSeong: 6 },
          { artId: "moyong-hubal-seonji-sword", minSeong: 5 }
        ]
      },
      // ─── 심법(qigong) 8 — 되돌림과 차력의 기 ────────────────────────────────
      {
        id: "moyong-hoeryu-simbeop",
        name: "\uD68C\uB958\uC2EC\uBC95",
        hanjaName: "\u56DE\u6D41\u5FC3\u6CD5",
        description: "\uAC70\uC2AC\uB7EC \uB3C4\uB294 \uBB3C\uAE38\uCC98\uB7FC \uAE30\uC6B4\uC744 \uB418\uB3CC\uB824 \uAE30\uB974\uB294 \uBAA8\uC6A9\uAC00\uC758 \uAE30\uCD08 \uC2EC\uBC95.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest"
      },
      {
        id: "moyong-yeonga-tonap-gong",
        name: "\uC5F0\uAC00\uD1A0\uB0A9\uACF5",
        hanjaName: "\u71D5\u5BB6\u5410\u7D0D\u529F",
        description: "\uC5F0\uB098\uB77C \uC655\uAC00\uC5D0\uC11C \uB0B4\uB824\uC654\uB2E4 \uC804\uD558\uB294 \uBAA8\uC6A9\uAC00\uC758 \uD638\uD761\uBC95.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "moyong-hoeryu-simbeop", minSeong: 2 }]
      },
      {
        id: "moyong-charyeok-gyeol",
        name: "\uCC28\uB825\uACB0",
        hanjaName: "\u501F\u529B\u8A23",
        description: "\uC0C1\uB300\uC758 \uD798\uC744 \uBE4C\uB824 \uB0B4 \uD798\uC73C\uB85C \uC4F0\uB294 \uBAA8\uC6A9\uAC00 \uCC28\uB825\uD0C0\uB825\uC758 \uC785\uBB38 \uAD6C\uACB0.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "moyong-hoeryu-simbeop", minSeong: 3 }]
      },
      {
        id: "moyong-saryang-balcheongeun",
        name: "\uC0AC\uB7C9\uBC1C\uCC9C\uADFC",
        hanjaName: "\u56DB\u5169\u64A5\u5343\u65A4",
        description: "\uB109 \uB0E5\uC758 \uD798\uC73C\uB85C \uCC9C \uADFC\uC744 \uD758\uB824\uBCF4\uB0B8\uB2E4\uB294 \uCC28\uB825\uC758 \uC694\uACB0.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "moyong-charyeok-gyeol", minSeong: 4 }]
      },
      {
        id: "moyong-sugyeong-simgong",
        name: "\uC218\uACBD\uC2EC\uACF5",
        hanjaName: "\u6C34\u93E1\u5FC3\u529F",
        description: "\uBB3C\uAC70\uC6B8\uCC98\uB7FC \uACE0\uC694\uD55C \uB9C8\uC74C\uC5D0 \uC0C1\uB300\uC758 \uCD08\uC2DD\uC744 \uBE44\uCD94\uC5B4 \uC77D\uB294 \uBAA8\uC6A9\uAC00\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "moyong-yeonga-tonap-gong", minSeong: 3 }]
      },
      {
        id: "moyong-bantan-ganggi",
        name: "\uBC18\uD0C4\uAC15\uAE30",
        hanjaName: "\u53CD\u5F48\u7F61\u6C23",
        description: "\uBAB8\uC5D0 \uB2FF\uC740 \uACBD\uB825\uC744 \uAC15\uAE30\uB85C \uD295\uACA8 \uB418\uB3CC\uB9AC\uB294 \uBAA8\uC6A9\uAC00\uC758 \uC0C1\uC2B9 \uC2EC\uBC95.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "moyong-saryang-balcheongeun", minSeong: 5 }]
      },
      {
        id: "dujeon-seongi",
        name: "\uB450\uC804\uC131\uC774",
        hanjaName: "\u6597\u8F49\u661F\u79FB",
        description: "\uBCC4\uC790\uB9AC\uB97C \uC62E\uAE30\uB4EF \uC0C1\uB300\uC758 \uD798\uC744 \uADF8\uB300\uB85C \uB418\uB3CC\uB9AC\uB294 \uBAA8\uC6A9\uAC00\uC758 \uAC00\uC804 \uC808\uAE30.",
        school: "qigong",
        grade: "grandmaster",
        path: "jung",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [
          { artId: "geongon-paseom-sword", minSeong: 6 },
          { artId: "ssangyong-seonpung-sword", minSeong: 4 }
        ]
      },
      {
        id: "moyong-ogi-jowon-gong",
        name: "\uD68C\uC6D0\uC2E0\uACF5",
        hanjaName: "\u56DE\u5143\u795E\u529F",
        description: "\uB2E4\uC12F \uAC08\uB798 \uAE30\uC6B4\uC774 \uADFC\uC6D0\uC73C\uB85C \uB3CC\uC544\uC628\uB2E4 \u2014 \uB418\uB3CC\uB9BC\uC758 \uBB18\uB9AC\uAC00 \uC644\uC131\uB418\uB294 \uBAA8\uC6A9\uAC00 \uC2EC\uBC95\uC758 \uC815\uC810.",
        school: "qigong",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [
          { artId: "moyong-bantan-ganggi", minSeong: 6 },
          { artId: "moyong-sugyeong-simgong", minSeong: 5 }
        ]
      },
      // ─── 보법(lightness) 5 — 제비의 걸음 ────────────────────────────────────
      {
        id: "moyong-yeonbi-bo",
        name: "\uC5F0\uBE44\uBCF4",
        hanjaName: "\u71D5\u98DB\u6B65",
        description: "\uC81C\uBE44\uAC00 \uB0AE\uAC8C \uB0A0\uB4EF \uBE60\uB974\uACE0 \uAC00\uBCCD\uAC8C \uD750\uB974\uB294 \uBAA8\uC6A9\uAC00\uC758 \uAE30\uCD08 \uBCF4\uBC95.",
        school: "lightness",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "moyong-biyeon-pyo",
        name: "\uBE44\uC5F0\uD45C",
        hanjaName: "\u98DB\u71D5\u98C4",
        description: "\uB098\uB294 \uC81C\uBE44\uAC00 \uBC14\uB78C\uC5D0 \uC2E4\uB9AC\uB4EF \uC885\uC801 \uC5C6\uC774 \uB5A0\uB3C4\uB294 \uBAA8\uC6A9\uAC00\uC758 \uACBD\uACF5.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "moyong-yeonbi-bo", minSeong: 3 }]
      },
      {
        id: "moyong-suun-sinbeop",
        name: "\uC218\uC6B4\uC2E0\uBC95",
        hanjaName: "\u6C34\u96F2\u8EAB\u6CD5",
        description: "\uACE0\uC18C\uC758 \uBB3C\uC548\uAC1C\uCC98\uB7FC \uC7A1\uD790 \uB4EF \uC7A1\uD788\uC9C0 \uC54A\uB294 \uBAA8\uC6A9\uAC00\uC758 \uC2E0\uBC95.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "moyong-yeonbi-bo", minSeong: 3 }]
      },
      {
        id: "moyong-chukji-seongchon",
        name: "\uCD95\uC9C0\uC131\uCD0C",
        hanjaName: "\u7E2E\u5730\u6210\u5BF8",
        description: "\uB545\uC744 \uC811\uC5B4 \uCC9C \uB9AC\uB97C \uD55C \uCE58\uB85C \uC904\uC778\uB2E4\uB294 \uBAA8\uC6A9\uAC00\uC758 \uC0C1\uC2B9 \uACBD\uACF5.",
        school: "lightness",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "moyong-biyeon-pyo", minSeong: 5 }]
      },
      {
        id: "moyong-neunggong-heodo",
        name: "\uB2A5\uACF5\uD5C8\uB3C4",
        hanjaName: "\u51CC\u7A7A\u865B\u6E21",
        description: "\uD5C8\uACF5\uC744 \uBC1F\uACE0 \uAC74\uB10C\uB2E4\uB294 \uACBD\uACF5\uC758 \uC9C0\uADF9\uD55C \uACBD\uC9C0. \uBAA8\uC6A9\uAC00\uC5D0 \uADF8 \uBE44\uACB0\uC774 \uC804\uD55C\uB2E4.",
        school: "lightness",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [
          { artId: "moyong-chukji-seongchon", minSeong: 6 },
          { artId: "moyong-suun-sinbeop", minSeong: 5 }
        ]
      },
      // ─── 권(fist) 3 — 흘리는 손 ─────────────────────────────────────────────
      {
        id: "moyong-yeonun-su",
        name: "\uC5F0\uC6B4\uC218",
        hanjaName: "\u71D5\u96F2\u624B",
        description: "\uC5F0 \uB545\uC758 \uAD6C\uB984\uCC98\uB7FC \uBCC0\uD654\uBB34\uC30D\uD558\uAC8C \uAC10\uACE0 \uD758\uB9AC\uB294 \uBAA8\uC6A9\uAC00\uC758 \uAE30\uCD08 \uC218\uBC95.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest"
      },
      {
        id: "moyong-inhwa-su",
        name: "\uC778\uD654\uC218",
        hanjaName: "\u5F15\u5316\u624B",
        description: "\uB04C\uC5B4\uB4E4\uC5EC \uB179\uC778\uB2E4 \u2014 \uC0C1\uB300\uC758 \uC8FC\uBA39\uC744 \uC81C \uAE38\uB85C \uC774\uB04C\uC5B4 \uD758\uB9AC\uB294 \uBAA8\uC6A9\uAC00\uC758 \uC218\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "moyong-yeonun-su", minSeong: 3 }]
      },
      {
        id: "moyong-ihwa-jeommok-su",
        name: "\uC774\uD654\uC811\uBAA9\uC218",
        hanjaName: "\u79FB\u82B1\u63A5\u6728\u624B",
        description: "\uAF43\uC744 \uC62E\uACA8 \uB098\uBB34\uC5D0 \uC787\uB4EF \uC0C1\uB300\uC758 \uD798\uC904\uAE30\uB97C \uBC14\uAFD4 \uB418\uB3CC\uB9AC\uB294 \uBAA8\uC6A9\uAC00\uC758 \uC808\uD559.",
        school: "fist",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "moyong",
        acquisition: "quest",
        prerequisites: [{ artId: "moyong-inhwa-su", minSeong: 5 }]
      }
    ];
  }
});

// src/data/martialArts/catalog/pyoguk.ts
var PYOGUK_ARTS;
var init_pyoguk = __esm({
  "src/data/martialArts/catalog/pyoguk.ts"() {
    "use strict";
    PYOGUK_ARTS = [
      // ─── 도(saber) 12 — 길을 여는 칼 ────────────────────────────────────────
      {
        id: "bopyo-dobeop",
        name: "\uBCF4\uD45C\uB3C4\uBC95",
        hanjaName: "\u4FDD\u93E2\u5200\u6CD5",
        description: "\uD45C\uBB3C\uC744 \uC9C0\uD0A4\uB294 \uD45C\uC0AC\uB4E4\uC758 \uC2E4\uC804 \uB3C4\uBC95. \uD654\uB824\uD568 \uC5C6\uC774 \uBB35\uC9C1\uD558\uB2E4.",
        school: "saber",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest"
      },
      {
        id: "pyoguk-masang-do",
        name: "\uB9C8\uC0C1\uB3C4\uBC95",
        hanjaName: "\u99AC\u4E0A\u5200\u6CD5",
        description: "\uB9D0 \uC704\uC5D0\uC11C \uB0B4\uB9AC\uBCA0\uB294 \uD45C\uC0AC\uC758 \uB3C4\uBC95. \uD754\uB4E4\uB9AC\uB294 \uC548\uC7A5 \uC704\uAC00 \uACE7 \uC5F0\uBB34\uC7A5\uC774\uB2E4.",
        school: "saber",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "bopyo-dobeop", minSeong: 2 }]
      },
      {
        id: "pyoguk-hosong-do",
        name: "\uD638\uC1A1\uB3C4\uBC95",
        hanjaName: "\u8B77\u9001\u5200\u6CD5",
        description: "\uD45C\uBB3C \uACC1\uC744 \uD55C \uBC1C\uC9DD\uB3C4 \uB5A0\uB098\uC9C0 \uC54A\uACE0 \uC9C0\uCF1C \uBCA0\uB294 \uD45C\uC0AC\uC758 \uB3C4\uBC95.",
        school: "saber",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "bopyo-dobeop", minSeong: 2 }]
      },
      {
        id: "pyoguk-parang-do",
        name: "\uD30C\uB791\uB3C4",
        hanjaName: "\u7834\u6D6A\u5200",
        description: "\uBB3C\uAE38 \uD45C\uD589\uC5D0\uC11C \uB2E4\uB4EC\uC5B4\uC9C4 \uB3C4\uBC95. \uBC43\uC804\uC758 \uD754\uB4E4\uB9BC\uC744 \uCE7C\uC758 \uD750\uB984\uC73C\uB85C \uC0BC\uB294\uB2E4.",
        school: "saber",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "pyoguk-masang-do", minSeong: 3 }]
      },
      {
        id: "pyoguk-chamma-do",
        name: "\uCC38\uB9C8\uB3C4\uBC95",
        hanjaName: "\u65AC\u99AC\u5200\u6CD5",
        description: "\uB9C8\uC801\uC758 \uB9D0\uBD80\uD130 \uBCA0\uC5B4 \uAE30\uC138\uB97C \uAEBE\uB294 \uD45C\uAD6D\uC758 \uC2E4\uC804 \uB3C4\uBC95.",
        school: "saber",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "pyoguk-masang-do", minSeong: 4 }]
      },
      {
        id: "pyoguk-yeonhwan-samdo",
        name: "\uC5F0\uD658\uC0BC\uB3C4",
        hanjaName: "\u9023\u74B0\u4E09\u5200",
        description: "\uC138 \uCE7C\uC774 \uD55C \uD638\uD761\uC5D0 \uC774\uC5B4\uC9C0\uB294 \uD45C\uAD6D\uC758 \uC2E4\uC804 \uC5F0\uD658\uB3C4.",
        school: "saber",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "pyoguk-hosong-do", minSeong: 3 }]
      },
      {
        id: "gwangpung-do",
        name: "\uAD11\uD48D\uB3C4",
        hanjaName: "\u72C2\u98A8\u5200",
        description: "\uBBF8\uCE5C\uBC14\uB78C\uCC98\uB7FC \uBAB0\uC544\uCE58\uB294 \uD45C\uAD6D\uC758 \uC0C1\uC2B9 \uB3C4\uBC95.",
        school: "saber",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "bopyo-dobeop", minSeong: 5 }]
      },
      {
        id: "pyoguk-pungu-do",
        name: "\uD48D\uC6B0\uB3C4\uBC95",
        hanjaName: "\u98A8\u96E8\u5200\u6CD5",
        description: "\uBE44\uBC14\uB78C \uCE58\uB294 \uD5D8\uB85C\uC5D0\uC11C \uBCBC\uB824\uC9C4 \uB3C4\uBC95. \uAD82\uC740 \uB0A0\uC77C\uC218\uB85D \uB9E4\uC11C\uC6CC\uC9C4\uB2E4.",
        school: "saber",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "pyoguk-parang-do", minSeong: 5 }]
      },
      {
        id: "pyoguk-jeollyeong-do",
        name: "\uC808\uB839\uB3C4\uBC95",
        hanjaName: "\u7D76\u5DBA\u5200\u6CD5",
        description: "\uAE4E\uC544\uC9C0\uB978 \uACE0\uAC2F\uAE38\uC758 \uB9E4\uBCF5\uC744 \uB6AB\uC5B4\uC628 \uD45C\uAD6D\uC758 \uC0C1\uC2B9 \uB3C4\uBC95.",
        school: "saber",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "pyoguk-chamma-do", minSeong: 5 }]
      },
      {
        id: "pyoguk-baekjeon-do",
        name: "\uBC31\uC804\uB3C4\uBC95",
        hanjaName: "\u767E\u6230\u5200\u6CD5",
        description: "\uBC31 \uBC88\uC758 \uD45C\uD589, \uBC31 \uBC88\uC758 \uC2F8\uC6C0\uC774 \uB2E4\uB4EC\uC740 \uAD70\uB354\uB354\uAE30 \uC5C6\uB294 \uB3C4\uBC95.",
        school: "saber",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "pyoguk-yeonhwan-samdo", minSeong: 5 }]
      },
      {
        id: "pyoguk-gaero-do",
        name: "\uAC1C\uB85C\uB3C4\uBC95",
        hanjaName: "\u958B\u8DEF\u5200\u6CD5",
        description: "\uB9C9\uD78C \uAE38\uC744 \uCE7C\uB85C \uC5F0\uB2E4 \u2014 \uD589\uB82C\uC758 \uB9E8 \uC55E\uC5D0 \uC11C\uB294 \uD45C\uB450\uC758 \uC0C1\uC2B9 \uB3C4\uBC95.",
        school: "saber",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "pyoguk-yeonhwan-samdo", minSeong: 5 }]
      },
      {
        id: "pyoguk-malli-dokhaeng-do",
        name: "\uB9CC\uB9AC\uB3C5\uD589\uB3C4",
        hanjaName: "\u842C\u91CC\u7368\u884C\u5200",
        description: "\uB9CC \uB9AC \uAE38\uC744 \uD640\uB85C \uAC00\uACE0 \uD640\uB85C \uC9C0\uD0A8\uB2E4\uB294 \uD45C\uAD6D \uB3C4\uBC95\uC758 \uC815\uC810. \uB299\uC740 \uCD1D\uD45C\uB450\uB9CC\uC774 \uADF8 \uB05D\uC744 \uBCF4\uC558\uB2E4.",
        school: "saber",
        grade: "grandmaster",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [
          { artId: "pyoguk-pungu-do", minSeong: 6 },
          { artId: "pyoguk-baekjeon-do", minSeong: 5 }
        ]
      },
      // ─── 권(fist) 7 — 길바닥의 박투 ─────────────────────────────────────────
      {
        id: "pyoguk-chabu-gwon",
        name: "\uCC28\uBD80\uAD8C",
        hanjaName: "\u8ECA\u592B\u62F3",
        description: "\uC218\uB808\uAFBC\uC758 \uC5B4\uAE68\uC640 \uD5C8\uB9AC\uC5D0\uC11C \uB098\uC628 \uD45C\uAD6D\uC758 \uAE30\uCD08 \uAD8C\uBC95. \uAFB8\uBC08\uC5C6\uC774 \uC2E4\uD558\uB2E4.",
        school: "fist",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest"
      },
      {
        id: "pyoguk-mabo-gwon",
        name: "\uB9C8\uBCF4\uAD8C",
        hanjaName: "\u99AC\u6B65\u62F3",
        description: "\uB9D0\uB69D\uCC98\uB7FC \uBC84\uD2F0\uB294 \uD558\uCCB4\uC5D0\uC11C \uC8FC\uBA39\uC744 \uBF51\uB294 \uD45C\uAD6D\uC758 \uAE30\uCD08 \uAD8C\uBC95.",
        school: "fist",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "pyoguk-chabu-gwon", minSeong: 2 }]
      },
      {
        id: "hosang-gwon",
        name: "\uD638\uC0C1\uAD8C",
        hanjaName: "\u8B77\u5546\u62F3",
        description: "\uB9E8\uC190\uC73C\uB85C \uC0C1\uB2E8\uC744 \uC9C0\uD0A4\uB294 \uD45C\uC0AC\uC758 \uAD8C\uBC95. \uC9C0\uAD6C\uC804\uC5D0 \uAC15\uD558\uB2E4.",
        school: "fist",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest"
      },
      {
        id: "pyoguk-geumna-su",
        name: "\uAE08\uB098\uC218",
        hanjaName: "\u64D2\u62FF\u624B",
        description: "\uB9E8\uC190\uC73C\uB85C \uC190\uBAA9\uC744 \uAEBE\uC5B4 \uCE7C\uC744 \uB5A8\uAD6C\uB294 \uD45C\uC0AC\uC758 \uC0AC\uB85C\uC7A1\uB294 \uC218\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "pyoguk-chabu-gwon", minSeong: 3 }]
      },
      {
        id: "pyoguk-siplo-tantoe",
        name: "\uC2ED\uB85C\uD0C4\uD1F4",
        hanjaName: "\u5341\u8DEF\u5F48\u817F",
        description: "\uC5F4 \uAC08\uB798\uB85C \uCC28\uC62C\uB9AC\uB294 \uB2E4\uB9AC \uAE30\uC220. \uAE38\uBC14\uB2E5 \uC2F8\uC6C0\uC5D0\uC11C \uC794\uBF08\uAC00 \uAD75\uC5C8\uB2E4.",
        school: "fist",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "pyoguk-mabo-gwon", minSeong: 3 }]
      },
      {
        id: "pyoguk-tongbae-gwon",
        name: "\uD1B5\uBC30\uAD8C",
        hanjaName: "\u901A\u80CC\u62F3",
        description: "\uB4F1\uC758 \uD798\uC744 \uD314\uB05D\uAE4C\uC9C0 \uD55C \uC904\uB85C \uAFF0\uC5B4 \uCE58\uB294 \uD45C\uAD6D\uC758 \uC0C1\uC2B9 \uAD8C\uBC95.",
        school: "fist",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "pyoguk-siplo-tantoe", minSeong: 5 }]
      },
      {
        id: "pyoguk-bungeun-chakgol-su",
        name: "\uBD84\uADFC\uCC29\uACE8\uC218",
        hanjaName: "\u5206\u7B4B\u932F\u9AA8\u624B",
        description: "\uD798\uC904\uC744 \uAC00\uB974\uACE0 \uBF08\uB97C \uC5B4\uAE0B\uB0B8\uB2E4 \u2014 \uC8FD\uC774\uC9C0 \uC54A\uACE0 \uC81C\uC555\uD558\uB294 \uD45C\uAD6D\uC758 \uC0C1\uC2B9 \uC218\uBC95.",
        school: "fist",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "pyoguk-geumna-su", minSeong: 5 }]
      },
      // ─── 외공(external) 6 — 짐꾼의 몸 ───────────────────────────────────────
      {
        id: "pyoguk-cheolgyeon-gong",
        name: "\uCCA0\uACAC\uACF5",
        hanjaName: "\u9435\u80A9\u529F",
        description: "\uCC9C \uADFC \uC9D0\uC744 \uC9C4 \uC5B4\uAE68\uAC00 \uBB34\uC1E0\uAC00 \uB41C\uB2E4\uB294 \uD45C\uAD6D\uC758 \uAE30\uCD08 \uC678\uACF5.",
        school: "external",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest"
      },
      {
        id: "cheolpi-gong",
        name: "\uCCA0\uD53C\uACF5",
        hanjaName: "\u9435\u76AE\u529F",
        description: "\uB099\uC11D\uACFC \uB3C4\uC801\uC758 \uCE7C\uC744 \uB9E8\uBAB8\uC73C\uB85C \uBC1B\uC544\uB0B8 \uD45C\uC0AC\uB4E4\uC758 \uC678\uACF5.",
        school: "external",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest"
      },
      {
        id: "pyoguk-cheolgak-gong",
        name: "\uCCA0\uAC01\uACF5",
        hanjaName: "\u9435\u811A\u529F",
        description: "\uAC15\uD589\uAD70\uC73C\uB85C \uB2E4\uC838\uC9C4 \uB2E4\uB9AC\uAC00 \uBB34\uC1E0 \uAE30\uB465\uC774 \uB418\uB294 \uD45C\uAD6D\uC758 \uC678\uACF5.",
        school: "external",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "pyoguk-cheolgyeon-gong", minSeong: 3 }]
      },
      {
        id: "pyoguk-cheongeun-chu",
        name: "\uCC9C\uADFC\uCD94",
        hanjaName: "\u5343\u65A4\u589C",
        description: "\uBC1C\uB05D\uC5D0 \uCC9C \uADFC \uCD94\uB97C \uB2E8 \uB4EF \uC5B4\uB5A4 \uCDA9\uACA9\uC5D0\uB3C4 \uBC00\uB9AC\uC9C0 \uC54A\uB294 \uD45C\uAD6D\uC758 \uC678\uACF5.",
        school: "external",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "pyoguk-cheolgyeon-gong", minSeong: 3 }]
      },
      {
        id: "pyoguk-banseok-gong",
        name: "\uBC18\uC11D\uACF5",
        hanjaName: "\u78D0\u77F3\u529F",
        description: "\uBC18\uC11D\uCC98\uB7FC \uBC84\uD168 \uD45C\uBB3C \uC55E\uC744 \uB9C9\uC544\uC11C\uB294 \uD45C\uAD6D\uC758 \uC0C1\uC2B9 \uC678\uACF5.",
        school: "external",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "pyoguk-cheongeun-chu", minSeong: 5 }]
      },
      {
        id: "pyoguk-geumseong-cheolbyeok-gong",
        name: "\uAE08\uC131\uCCA0\uBCBD\uACF5",
        hanjaName: "\u91D1\u57CE\u9435\u58C1\u529F",
        description: "\uBAB8\uC774 \uACE7 \uC1E0\uB85C \uC313\uC740 \uC131\uBCBD\uC774 \uB41C\uB2E4 \u2014 \uD45C\uBB3C\uC744 \uC9C0\uD0A4\uB2E4 \uC644\uC131\uB41C \uD45C\uAD6D \uC678\uACF5\uC758 \uC815\uC810.",
        school: "external",
        grade: "grandmaster",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [
          { artId: "pyoguk-banseok-gong", minSeong: 6 },
          { artId: "pyoguk-cheolgak-gong", minSeong: 5 }
        ]
      },
      // ─── 보법(lightness) 3 — 먼 길의 걸음 ───────────────────────────────────
      {
        id: "pyoguk-haengro-bo",
        name: "\uD589\uB85C\uBCF4",
        hanjaName: "\u884C\u8DEF\u6B65",
        description: "\uBA3C \uAE38\uC744 \uC9C0\uCE58\uC9C0 \uC54A\uACE0 \uC904\uC5EC \uAC77\uB294 \uD45C\uC0AC\uC758 \uAC78\uC74C\uBC95.",
        school: "lightness",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "pyoguk-bicheom-jubyeok",
        name: "\uCC9C\uB9AC\uD589\uBCF4",
        hanjaName: "\u5343\u91CC\u884C\u6B65",
        description: "\uCC98\uB9C8\uB97C \uB0A0\uACE0 \uB2F4\uBCBC\uB77D\uC744 \uB2EC\uB9B0\uB2E4 \u2014 \uC57C\uC2B5\uC744 \uCAD3\uACE0 \uCAD3\uAE30\uB294 \uD45C\uC0AC\uC758 \uACBD\uACF5.",
        school: "lightness",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "pyoguk-haengro-bo", minSeong: 3 }]
      },
      {
        id: "pyoguk-cheolli-sinhaeng",
        name: "\uCC9C\uB9AC\uC2E0\uD589",
        hanjaName: "\u5343\u91CC\u795E\u884C",
        description: "\uD558\uB8E8\uC5D0 \uCC9C \uB9AC\uB97C \uAC04\uB2E4\uB294 \uD45C\uAD6D\uC758 \uC0C1\uC2B9 \uACBD\uACF5. \uAE09\uBCF4\uAC00 \uC0AC\uB78C\uBCF4\uB2E4 \uB2A6\uB2E4.",
        school: "lightness",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "pyoguk-bicheom-jubyeok", minSeong: 5 }]
      },
      // ─── 심법(qigong) 2 — 길 위의 호흡 ──────────────────────────────────────
      {
        id: "pyoguk-wonhaeng-simbeop",
        name: "\uC6D0\uD589\uC2EC\uBC95",
        hanjaName: "\u9060\u884C\u5FC3\u6CD5",
        description: "\uBA3C \uD45C\uD589\uAE38\uC758 \uD638\uD761\uBC95. \uC228\uC744 \uC544\uAEF4 \uC4F0\uACE0 \uAE38\uAC8C \uBC84\uD2F4\uB2E4.",
        school: "qigong",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest"
      },
      {
        id: "pyoguk-naejang-gong",
        name: "\uB0B4\uC7A5\uACF5",
        hanjaName: "\u5167\u58EF\u529F",
        description: "\uAC89\uC774 \uC544\uB2C8\uB77C \uC18D\uC744 \uB2E8\uB828\uD55C\uB2E4 \u2014 \uC624\uC7A5\uC744 \uD2BC\uD2BC\uD788 \uB2E4\uC9C0\uB294 \uD45C\uAD6D\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "pyoguk",
        acquisition: "quest",
        prerequisites: [{ artId: "pyoguk-wonhaeng-simbeop", minSeong: 3 }]
      }
    ];
  }
});

// src/data/martialArts/catalog/doga.ts
var DOGA_ARTS;
var init_doga = __esm({
  "src/data/martialArts/catalog/doga.ts"() {
    "use strict";
    DOGA_ARTS = [
      // ─── 심법(qigong) 12 — 정심결 줄기에서 좌망·청허 두 갈래, 오기조원에서 합류 ───
      {
        id: "jeongsim-gyeol",
        name: "\uC815\uC2EC\uACB0",
        hanjaName: "\u5B9A\u5FC3\u8A23",
        description: "\uB9C8\uC74C\uC744 \uD55C \uC810\uC5D0 \uBB36\uB294 \uB3C4\uAC00\uC758 \uAE30\uCD08 \uAD6C\uACB0.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest"
      },
      {
        id: "doga-jwamang-gyeol",
        name: "\uC88C\uB9DD\uACB0",
        hanjaName: "\u5750\u5FD8\u8A23",
        description: "\uC549\uC740 \uCC44 \uB098\uB97C \uC78A\uB294\uB2E4 \u2014 \uC7A5\uC790\uC758 \uC88C\uB9DD\uC5D0\uC11C \uB098\uC628 \uB3C4\uAC00\uC758 \uC785\uC815 \uAD6C\uACB0.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "jeongsim-gyeol", minSeong: 3 }]
      },
      {
        id: "hyeonmun-jeongjong",
        name: "\uD604\uBB38\uC815\uC885\uC2EC\uBC95",
        hanjaName: "\u7384\u9580\u6B63\u5B97\u5FC3\u6CD5",
        description: "\uB3C4\uBB38 \uC815\uD1B5\uC758 \uD638\uD761\uBC95. \uB290\uB9AC\uC9C0\uB9CC \uADF8\uB987\uC774 \uAE4A\uB2E4.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "jeongsim-gyeol", minSeong: 4 }]
      },
      {
        id: "doga-baegun-simbeop",
        name: "\uBC31\uC6B4\uC2EC\uBC95",
        hanjaName: "\u767D\u96F2\u5FC3\u6CD5",
        description: "\uC0B0\uB9C8\uB8E8\uC758 \uD770 \uAD6C\uB984\uCC98\uB7FC \uB9D1\uACE0 \uD55C\uAC00\uB85C\uC6B4 \uAE30\uC6B4\uC744 \uAE30\uB974\uB294 \uB3C4\uAC00\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "doga-jwamang-gyeol", minSeong: 3 }]
      },
      {
        id: "doga-cheongheo-gong",
        name: "\uCCAD\uD5C8\uACF5",
        hanjaName: "\u6DF8\u865B\u529F",
        description: "\uB9D1\uAC8C \uBE44\uC6B4 \uADF8\uB987\uC5D0 \uAE30\uC6B4\uC774 \uC808\uB85C \uACE0\uC778\uB2E4\uB294 \uB3C4\uAC00\uC758 \uD1A0\uB0A9 \uACF5\uBD80.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "jeongsim-gyeol", minSeong: 4 }]
      },
      {
        id: "doga-songpung-gyeol",
        name: "\uC1A1\uD48D\uACB0",
        hanjaName: "\u677E\u98A8\u8A23",
        description: "\uC194\uC232\uC744 \uC9C0\uB098\uB294 \uBC14\uB78C \uC18C\uB9AC\uC5D0 \uD638\uD761\uC744 \uC2E3\uB294 \uC0B0\uBB38(\u5C71\u9580)\uC758 \uAD6C\uACB0.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "doga-jwamang-gyeol", minSeong: 3 }]
      },
      {
        id: "taecheong-gangki",
        name: "\uD0DC\uCCAD\uAC15\uAE30",
        hanjaName: "\u592A\u6DF8\u7F61\u6C23",
        description: "\uB9D1\uC740 \uAE30\uC6B4\uC774 \uBAB8\uC744 \uB450\uB974\uB294 \uB3C4\uAC00 \uC0C1\uC2B9 \uC2EC\uBC95.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "hyeonmun-jeongjong", minSeong: 5 }]
      },
      {
        id: "doga-samhwa-chwijeong-gong",
        name: "\uC790\uC624\uC2E0\uACF5",
        hanjaName: "\u5B50\u5348\u795E\u529F",
        description: "\uC138 \uC1A1\uC774 \uAF43\uC774 \uC815\uC218\uB9AC\uC5D0 \uBAA8\uC778\uB2E4\uB294 \uB3C4\uAC00 \uB0B4\uB2E8\uC758 \uB192\uC740 \uACBD\uACC4.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "hyeonmun-jeongjong", minSeong: 5 }]
      },
      {
        id: "doga-myeonggyeong-jisu-gong",
        name: "\uBA85\uACBD\uC9C0\uC218\uACF5",
        hanjaName: "\u660E\u93E1\u6B62\u6C34\u529F",
        description: "\uB2E6\uC740 \uAC70\uC6B8, \uBA4E\uC740 \uBB3C\uCC98\uB7FC \uD754\uB4E4\uB9BC \uC5C6\uB294 \uC2EC\uACBD\uC744 \uBE5A\uB294 \uC0C1\uC2B9 \uC2EC\uBC95.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "doga-baegun-simbeop", minSeong: 5 }]
      },
      {
        id: "doga-taeeul-hyeongong",
        name: "\uD0DC\uC744\uD604\uACF5",
        hanjaName: "\u592A\u4E59\u7384\u529F",
        description: "\uD0DC\uC744\uC758 \uD604\uBB18\uD55C \uAE30\uD2C0\uC744 \uB2E8\uC804\uC5D0 \uC0C8\uAE30\uB294 \uB3C4\uAC00 \uC0C1\uC2B9 \uACF5\uBD80.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "doga-cheongheo-gong", minSeong: 5 }]
      },
      {
        id: "doga-ogi-jowon-singong",
        name: "\uC624\uAE30\uC870\uC6D0\uC2E0\uACF5",
        hanjaName: "\u4E94\u6C23\u671D\u5143\u795E\u529F",
        description: "\uB2E4\uC12F \uAE30\uC6B4\uC774 \uADFC\uC6D0\uC73C\uB85C \uB3CC\uC544\uC640 \uD558\uB098\uB85C \uBAA8\uC778\uB2E4 \u2014 \uB3C4\uAC00 \uB0B4\uB2E8\uC758 \uC815\uC810.",
        school: "qigong",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [
          { artId: "doga-samhwa-chwijeong-gong", minSeong: 6 },
          { artId: "taecheong-gangki", minSeong: 5 }
        ]
      },
      {
        id: "doga-hyeoncheon-singong",
        name: "\uD604\uC6D0\uC2E0\uACF5",
        hanjaName: "\u7384\u5143\u795E\u529F",
        description: "\uAC80\uC740 \uD558\uB298\uC758 \uAE4A\uC774\uB97C \uB2E8\uC804\uC5D0 \uB2F4\uB294\uB2E4\uB294 \uB3C4\uAC00 \uBE44\uC804\uC758 \uC2E0\uACF5.",
        school: "qigong",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "doga-taeeul-hyeongong", minSeong: 7 }]
      },
      // ─── 보법(lightness) 6 — 청풍보 뿌리, 소요·답운 분기 → 소요유신법 합류 ───
      {
        id: "doga-cheongpung-bo",
        name: "\uBC31\uC6B4\uBCF4",
        hanjaName: "\u767D\u96F2\u6B65",
        description: "\uB9D1\uC740 \uBC14\uB78C\uC774 \uACE8\uC9DC\uAE30\uB97C \uC9C0\uB098\uB4EF \uAC00\uBCCD\uAC8C \uB51B\uB294 \uB3C4\uAC00\uC758 \uAE30\uCD08 \uBCF4\uBC95.",
        school: "lightness",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "doga-soyo-bo",
        name: "\uC18C\uC694\uBCF4",
        hanjaName: "\u900D\u9059\u6B65",
        description: "\uC5BD\uB9E4\uC784 \uC5C6\uC774 \uB178\uB2D0 \uB4EF \uD750\uB974\uB294 \uAC78\uC74C \u2014 \uC18C\uC694\uC720\uC758 \uACB0\uC744 \uB2F4\uC740 \uBCF4\uBC95.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "doga-cheongpung-bo", minSeong: 3 }]
      },
      {
        id: "doga-dabun-bo",
        name: "\uC720\uC6B4\uBCF4",
        hanjaName: "\u6D41\u96F2\u6B65",
        description: "\uC0B0\uD5C8\uB9AC \uAD6C\uB984\uC744 \uBC1F\uACE0 \uC624\uB974\uB4EF \uC19F\uAD6C\uCE58\uB294 \uB3C4\uAC00\uC758 \uBCF4\uBC95.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "doga-cheongpung-bo", minSeong: 3 }]
      },
      {
        id: "neungheo-eopung",
        name: "\uB2A5\uD5C8\uC5B4\uD48D",
        hanjaName: "\u51CC\u865B\u5FA1\u98A8",
        description: "\uBC14\uB78C\uC744 \uD0C0\uACE0 \uD5C8\uACF5\uC744 \uAC70\uB2C8\uB294 \uB3C4\uAC00\uC758 \uACBD\uACF5.",
        school: "lightness",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 5 }]
      },
      {
        id: "doga-haengun-yusu-bo",
        name: "\uD589\uC6B4\uC720\uC218\uBCF4",
        hanjaName: "\u884C\u96F2\u6D41\u6C34\u6B65",
        description: "\uAC00\uB294 \uAD6C\uB984\uACFC \uD750\uB974\uB294 \uBB3C\uCC98\uB7FC \uB04A\uAE40 \uC5C6\uC774 \uC774\uC5B4\uC9C0\uB294 \uC0C1\uC2B9 \uBCF4\uBC95.",
        school: "lightness",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "doga-soyo-bo", minSeong: 5 }]
      },
      {
        id: "doga-soyoyu-sinbeop",
        name: "\uC18C\uC694\uC720\uC2E0\uBC95",
        hanjaName: "\u900D\u9059\u904A\u8EAB\u6CD5",
        description: "\uD558\uB298\uACFC \uB545 \uC0AC\uC774\uB97C \uC81C\uC9D1\uCC98\uB7FC \uB178\uB2CC\uB2E4 \u2014 \uB3C4\uAC00 \uC2E0\uBC95\uC758 \uC815\uC810.",
        school: "lightness",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [
          { artId: "doga-haengun-yusu-bo", minSeong: 6 },
          { artId: "neungheo-eopung", minSeong: 5 }
        ]
      },
      // ─── 검(sword) 6 — 청송검 뿌리, 유수·명월 분기 → 무위검 합류 ───
      {
        id: "doga-cheongsong-sword",
        name: "\uCCAD\uC1A1\uAC80",
        hanjaName: "\u9751\u677E\u528D",
        description: "\uB208\uC744 \uC774\uACE0\uB3C4 \uAD7D\uC9C0 \uC54A\uB294 \uD478\uB978 \uC194\uC758 \uACB0\uC744 \uBCF8\uB72C \uB3C4\uAC00\uC758 \uC785\uBB38 \uAC80.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest"
      },
      {
        id: "doga-baegun-sword",
        name: "\uBC31\uC6B4\uAC80",
        hanjaName: "\u767D\u96F2\u528D",
        description: "\uD770 \uAD6C\uB984\uC774 \uBD09\uC6B0\uB9AC\uB97C \uAC10\uB3CC\uB4EF \uBD80\uB4DC\uB7FD\uAC8C \uD718\uAC10\uB294 \uB3C4\uAC00\uC758 \uAC80.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "doga-cheongsong-sword", minSeong: 3 }]
      },
      {
        id: "doga-yusu-sword",
        name: "\uC57D\uC218\uAC80",
        hanjaName: "\u82E5\u6C34\u528D",
        description: "\uD750\uB974\uB294 \uBB3C\uC740 \uB2E4\uD22C\uC9C0 \uC54A\uC73C\uB098 \uB05D\uB0B4 \uBC14\uC704\uB97C \uB6AB\uB294\uB2E4 \u2014 \uB3C4\uAC00 \uC911\uAE09 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "doga-cheongsong-sword", minSeong: 3 }]
      },
      {
        id: "doga-myeongwol-sword",
        name: "\uBA85\uC6D4\uAC80",
        hanjaName: "\u660E\u6708\u528D",
        description: "\uC0B0\uC815\uC758 \uBC1D\uC740 \uB2EC\uCC98\uB7FC \uACE0\uC694\uD788 \uB5A0\uC11C \uD55C \uBC88\uC5D0 \uB0B4\uB9AC\uBE44\uCE58\uB294 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "doga-baegun-sword", minSeong: 3 }]
      },
      {
        id: "doga-taecheong-sword",
        name: "\uD0DC\uCCAD\uAC80\uBC95",
        hanjaName: "\u592A\u6DF8\u528D\u6CD5",
        description: "\uB9D1\uC740 \uAE30\uC6B4\uC744 \uAC80\uC5D0 \uC2E4\uC5B4 \uBCA0\uB294 \uB3C4\uAC00 \uC0C1\uC2B9 \uAC80\uBC95.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "doga-yusu-sword", minSeong: 5 }]
      },
      {
        id: "doga-muwi-sword",
        name: "\uBB34\uC704\uAC80",
        hanjaName: "\u7121\u7232\u528D",
        description: "\uD558\uB824 \uD568\uC774 \uC5C6\uC5B4 \uB9C9\uC744 \uAE38\uB3C4 \uC5C6\uB2E4 \u2014 \uBB3C\uACFC \uB2EC\uC774 \uD55C \uAC80\uC5D0\uC11C \uB9CC\uB098\uB294 \uB3C4\uAC00 \uAC80\uC758 \uC815\uC810.",
        school: "sword",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [
          { artId: "doga-taecheong-sword", minSeong: 6 },
          { artId: "doga-myeongwol-sword", minSeong: 5 }
        ]
      },
      // ─── 권(fist) 4 — 운수권 뿌리, 백학·표운 분기 → 오악신장 ───
      {
        id: "doga-unsu-gwon",
        name: "\uC6B4\uC218\uAD8C",
        hanjaName: "\u96F2\u624B\u62F3",
        description: "\uAD6C\uB984\uC744 \uC4F8 \uB4EF \uB465\uAE00\uAC8C \uAC10\uC544 \uD758\uB9AC\uB294 \uB3C4\uAC00\uC758 \uC785\uBB38 \uAD8C\uBC95.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest"
      },
      {
        id: "doga-baekhak-gwon",
        name: "\uBC31\uD559\uAD8C",
        hanjaName: "\u767D\u9DB4\u62F3",
        description: "\uD559\uC774 \uB0A0\uAC1C\uB97C \uD3B4\uACE0 \uC678\uB2E4\uB9AC\uB85C \uC11C\uB4EF \u2014 \uADE0\uD615\uC5D0\uC11C \uD798\uC744 \uBE4C\uB9AC\uB294 \uAD8C\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "doga-unsu-gwon", minSeong: 3 }]
      },
      {
        id: "doga-pyoun-jang",
        name: "\uD45C\uC6B4\uC7A5",
        hanjaName: "\u98C4\u96F2\u638C",
        description: "\uB5A0\uB3C4\uB294 \uAD6C\uB984\uCC98\uB7FC \uC885\uC7A1\uC744 \uC218 \uC5C6\uC774 \uD769\uC5B4\uC84C\uB2E4 \uBAA8\uC774\uB294 \uB3C4\uAC00\uC758 \uC7A5\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "doga-unsu-gwon", minSeong: 3 }]
      },
      {
        id: "doga-oak-sinjang",
        name: "\uC624\uC545\uC2E0\uC7A5",
        hanjaName: "\u4E94\u5CB3\u795E\u638C",
        description: "\uB2E4\uC12F \uC0B0\uC758 \uBB34\uAC8C\uB97C \uD55C \uC190\uBC14\uB2E5\uC5D0 \uC2E3\uB294\uB2E4\uB294 \uB3C4\uAC00 \uC7A5\uBC95\uC758 \uC815\uC218.",
        school: "fist",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "doga-baekhak-gwon", minSeong: 5 }]
      },
      // ─── 외공(external) 2 — 도인공 → 반석공 ───
      {
        id: "doga-doin-gong",
        name: "\uB3C4\uC778\uACF5",
        hanjaName: "\u5C0E\u5F15\u529F",
        description: "\uAE30\uB97C \uC774\uB04C\uC5B4 \uADFC\uACE8\uC744 \uD3B4\uB294 \uB3C4\uAC00\uC758 \uC624\uB79C \uC591\uC0DD \uC678\uACF5.",
        school: "external",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "jeongsim-gyeol", minSeong: 3 }]
      },
      {
        id: "doga-banseok-gong",
        name: "\uBD80\uB3D9\uACF5",
        hanjaName: "\u4E0D\u52D5\u529F",
        description: "\uC0B0\uC758 \uB108\uB7ED\uBC14\uC704\uCC98\uB7FC \uD754\uB4E4\uB9AC\uC9C0 \uC54A\uB294 \uBAB8\uC744 \uBE5A\uB294 \uB3C4\uAC00\uC758 \uC678\uACF5.",
        school: "external",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "doga",
        acquisition: "quest",
        prerequisites: [{ artId: "doga-doin-gong", minSeong: 3 }]
      }
    ];
  }
});

// src/data/martialArts/catalog/uiga.ts
var UIGA_ARTS;
var init_uiga = __esm({
  "src/data/martialArts/catalog/uiga.ts"() {
    "use strict";
    UIGA_ARTS = [
      // ─── 의가무공(medical) 16 — 점혈술입문 뿌리, 손·약·침 세 갈래 → 회생대법·묘수회춘 합류 ───
      {
        id: "jeomhyeol-immun",
        name: "\uC810\uD608\uC220\uC785\uBB38",
        hanjaName: "\u9EDE\u7A74\u8853\u5165\u9580",
        description: "\uD608\uB3C4\uB97C \uC9DA\uC5B4 \uC81C\uC555\uD558\uB294 \uC758\uAC00 \uBB34\uACF5\uC758 \uCCAB\uAC78\uC74C.",
        school: "medical",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest"
      },
      {
        id: "uiga-chuna-sul",
        name: "\uCD94\uB098\uC220",
        hanjaName: "\u63A8\u62FF\u8853",
        description: "\uBC00\uACE0 \uC8FC\uBB3C\uB7EC \uC5B4\uAE0B\uB09C \uBF08\uC640 \uB9C9\uD78C \uAE30\uB97C \uBC14\uB85C\uC7A1\uB294 \uC758\uAC00\uC758 \uC190 \uAE30\uC220.",
        school: "medical",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomhyeol-immun", minSeong: 3 }]
      },
      {
        id: "uiga-geumchang-uisul",
        name: "\uAE08\uCC3D\uC758\uC220",
        hanjaName: "\u91D1\u7621\u91AB\u8853",
        description: "\uCE7C\uACFC \uD654\uC0B4\uC5D0 \uCC22\uAE34 \uC0C1\uCC98\uB97C \uB2E4\uC2A4\uB9AC\uB294 \uAC15\uD638 \uC758\uAC00\uC758 \uAE30\uBCF8\uAE30.",
        school: "medical",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomhyeol-immun", minSeong: 3 }]
      },
      {
        id: "hwarin-geomgyeol",
        name: "\uD65C\uC778\uAC80\uACB0",
        hanjaName: "\u6D3B\u4EBA\u528D\u8A23",
        description: "\uBCA0\uC9C0 \uC54A\uACE0 \uC0B4\uB9AC\uB294 \uAC80 \u2014 \uD608\uC744 \uC9DA\uC5B4 \uC801\uC744 \uC7AC\uC6B0\uB294 \uC758\uAC00\uC758 \uAC80\uACB0.",
        school: "medical",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomhyeol-immun", minSeong: 3 }]
      },
      {
        id: "uiga-haehyeol-sul",
        name: "\uD574\uD608\uC220",
        hanjaName: "\u89E3\u7A74\u8853",
        description: "\uC9DA\uC778 \uD608\uC744 \uB3C4\uB85C \uD478\uB294 \uBC95 \u2014 \uC810\uD608\uC744 \uC544\uB294 \uC790\uB9CC\uC774 \uD480 \uC904\uB3C4 \uC548\uB2E4.",
        school: "medical",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "jeomhyeol-immun", minSeong: 4 }]
      },
      {
        id: "uiga-geumchim-sul",
        name: "\uAE08\uCE68\uC220",
        hanjaName: "\u91D1\u91DD\u8853",
        description: "\uAE08\uBE5B \uCE68 \uD55C \uB300\uB85C \uAE30\uD608\uC758 \uBB3C\uAE38\uC744 \uD2B8\uB294 \uC758\uAC00\uC758 \uCE68\uBC95.",
        school: "medical",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "uiga-chuna-sul", minSeong: 3 }]
      },
      {
        id: "uiga-hwalhyeol-su",
        name: "\uD65C\uD608\uC218",
        hanjaName: "\u6D3B\u8840\u624B",
        description: "\uB2FF\uB294 \uC190\uAE38\uB9C8\uB2E4 \uB9C9\uD78C \uD53C\uAC00 \uB3CC\uAC8C \uD558\uB294 \uC758\uAC00\uC758 \uC0B4\uB9AC\uB294 \uC190.",
        school: "medical",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "uiga-chuna-sul", minSeong: 3 }]
      },
      {
        id: "uiga-jeopgol-sul",
        name: "\uC811\uACE8\uC220",
        hanjaName: "\u63A5\u9AA8\u8853",
        description: "\uBD80\uB7EC\uC9C4 \uBF08\uB97C \uB2E8\uC228\uC5D0 \uB9DE\uCDB0 \uC787\uB294 \uC758\uAC00\uC758 \uC815\uACE8 \uC218\uBC95.",
        school: "medical",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "uiga-geumchang-uisul", minSeong: 3 }]
      },
      {
        id: "uiga-bongmaek-su",
        name: "\uBD09\uB9E5\uC218",
        hanjaName: "\u5C01\u8108\u624B",
        description: "\uB9E5\uC744 \uC9DA\uC5B4 \uBD09\uD574 \uD53C\uB97C \uBA4E\uAC8C \uD558\uACE0 \uB3C5\uC774 \uB3C4\uB294 \uAE38\uC744 \uB04A\uB294 \uC190 \uAE30\uC220.",
        school: "medical",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "uiga-geumchang-uisul", minSeong: 4 }]
      },
      {
        id: "haedok-sinjang",
        name: "\uD574\uB3C5\uC2E0\uC7A5",
        hanjaName: "\u89E3\u6BD2\u795E\u638C",
        description: "\uC7A5\uB825\uC73C\uB85C \uB3C5\uAE30\uB97C \uBF51\uC544\uB0B4\uB294 \uC758\uAC00\uC758 \uC0C1\uC2B9 \uC218\uBC95.",
        school: "medical",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "hwarin-geomgyeol", minSeong: 5 }]
      },
      {
        id: "uiseon-bogyeol",
        name: "\uC758\uC120\uBCF4\uACB0",
        hanjaName: "\u91AB\u4ED9\u5BF6\u8A23",
        description: "\uC758\uC120\uC774 \uB0A8\uACBC\uB2E4\uB294 \uC9C4\uADC0\uD55C \uAD6C\uACB0. \uC0AC\uB78C \uBAB8\uC758 \uC774\uCE58\uB97C \uAFF0\uB6AB\uB294\uB2E4.",
        school: "medical",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "hwarin-geomgyeol", minSeong: 5 }]
      },
      {
        id: "uiga-gugung-sinchim",
        name: "\uAD6C\uAD81\uC2E0\uCE68",
        hanjaName: "\u4E5D\u5BAE\u795E\u91DD",
        description: "\uC544\uD649 \uBC29\uC704\uC758 \uC694\uD608\uC5D0 \uCC28\uB840\uB85C \uCE68\uC744 \uB193\uC544 \uC8FD\uC740 \uAE30\uB9E5\uB3C4 \uAE68\uC6B4\uB2E4\uB294 \uCE68\uBC95\uC758 \uC815\uC218.",
        school: "medical",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "uiga-geumchim-sul", minSeong: 5 }]
      },
      {
        id: "uiga-yakwang-sinsu",
        name: "\uC57D\uC655\uC2E0\uC218",
        hanjaName: "\u85E5\u738B\u795E\u624B",
        description: "\uC57D\uC655\uC758 \uC190\uC774 \uB2FF\uC73C\uBA74 \uBC31 \uAC00\uC9C0 \uBCD1\uC774 \uBB3C\uB7EC\uB09C\uB2E4\uB294 \uC758\uAC00 \uC0C1\uC2B9 \uC218\uBC95.",
        school: "medical",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "uiga-hwalhyeol-su", minSeong: 5 }]
      },
      {
        id: "uiga-beolmo-sesu",
        name: "\uBC8C\uBAA8\uC138\uC218",
        hanjaName: "\u4F10\u6BDB\u6D17\u9AD3",
        description: "\uBB35\uC740 \uD138\uC744 \uBCA0\uACE0 \uACE8\uC218\uB97C \uC53B\uC5B4 \uBAB8\uC758 \uBC14\uD0D5\uC744 \uC0C8\uB85C \uBE5A\uB294 \uC758\uAC00\uC758 \uBE44\uBC95.",
        school: "medical",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "uiga-bongmaek-su", minSeong: 5 }]
      },
      {
        id: "hoesaeng-daebeop",
        name: "\uD68C\uC0DD\uB300\uBC95",
        hanjaName: "\u56DE\u751F\u5927\u6CD5",
        description: "\uB04A\uC5B4\uC9C4 \uC228\uC744 \uB418\uB3CC\uB9B0\uB2E4\uB294 \uC758\uAC00 \uCD5C\uD6C4\uC758 \uBE44\uC804.",
        school: "medical",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [
          { artId: "haedok-sinjang", minSeong: 6 },
          { artId: "uiseon-bogyeol", minSeong: 4 }
        ]
      },
      {
        id: "uiga-myosu-hoechun",
        name: "\uBB18\uC218\uD68C\uCD98",
        hanjaName: "\u5999\u624B\u56DE\u6625",
        description: "\uC2E0\uBB18\uD55C \uC190\uC774 \uB2FF\uC73C\uBA74 \uC2DC\uB4E0 \uBAA9\uC228\uC5D0 \uBD04\uC774 \uB3CC\uC544\uC628\uB2E4 \u2014 \uCE68\uACFC \uC190\uC774 \uB9CC\uB098\uB294 \uC758\uAC00\uC758 \uC815\uC810.",
        school: "medical",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [
          { artId: "uiga-gugung-sinchim", minSeong: 6 },
          { artId: "uiga-yakwang-sinsu", minSeong: 5 }
        ]
      },
      // ─── 심법(qigong) 6 — 양생결 뿌리, 주천·온양 분기 → 태식공 합류 ───
      {
        id: "uiga-yangsaeng-gyeol",
        name: "\uC591\uC0DD\uACB0",
        hanjaName: "\u990A\u751F\u8A23",
        description: "\uBCD1\uC744 \uB2E4\uC2A4\uB9AC\uAE30 \uC804\uC5D0 \uC81C \uBAB8\uBD80\uD130 \uAE30\uB978\uB2E4 \u2014 \uC758\uAC00\uC758 \uAE30\uCD08 \uC591\uC0DD \uAD6C\uACB0.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest"
      },
      {
        id: "uiga-ogeumhui",
        name: "\uC624\uAE08\uD76C",
        hanjaName: "\u4E94\u79BD\u6232",
        description: "\uD638\uB791\uC774\xB7\uC0AC\uC2B4\xB7\uACF0\xB7\uC6D0\uC22D\uC774\xB7\uC0C8\uC758 \uBAB8\uC9D3\uC744 \uBCF8\uB5A0 \uAE30\uD608\uC744 \uB3CC\uB9AC\uB294 \uC61B \uC758\uAC00\uC758 \uD589\uACF5.",
        school: "qigong",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "uiga-yangsaeng-gyeol", minSeong: 3 }]
      },
      {
        id: "uiga-jao-jucheon-gong",
        name: "\uC790\uC624\uC8FC\uCC9C\uACF5",
        hanjaName: "\u5B50\u5348\u5468\u5929\u529F",
        description: "\uC790\uC2DC\uC640 \uC624\uC2DC\uC5D0 \uB9DE\uCDB0 \uAE30\uB97C \uD55C \uBC14\uD034 \uB3CC\uB9AC\uB294 \uC758\uAC00\uC758 \uC6B4\uAE30 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "uiga-yangsaeng-gyeol", minSeong: 4 }]
      },
      {
        id: "uiga-onyang-simbeop",
        name: "\uC628\uC591\uC2EC\uBC95",
        hanjaName: "\u6EAB\u990A\u5FC3\u6CD5",
        description: "\uC57D\uD55C \uBD88\uB85C \uC624\uB798 \uB2EC\uC774\uB4EF \uAE30\uC6B4\uC744 \uB530\uB73B\uD558\uAC8C \uAE30\uB974\uB294 \uC758\uAC00\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "uiga-ogeumhui", minSeong: 3 }]
      },
      {
        id: "uiga-hwalin-simbang",
        name: "\uD65C\uC778\uC2EC\uBC29",
        hanjaName: "\u6D3B\u4EBA\u5FC3\u65B9",
        description: "\uC0AC\uB78C\uC744 \uC0B4\uB9AC\uB294 \uB9C8\uC74C\uC774 \uACE7 \uC57D\uC774 \uB41C\uB2E4\uB294 \uC758\uAC00 \uC0C1\uC2B9 \uC2EC\uBC95.",
        school: "qigong",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "uiga-jao-jucheon-gong", minSeong: 5 }]
      },
      {
        id: "uiga-taesik-gong",
        name: "\uD0DC\uC2DD\uACF5",
        hanjaName: "\u80CE\u606F\u529F",
        description: "\uC5B4\uBBF8 \uBC30 \uC18D \uC544\uC774\uCC98\uB7FC \uC228 \uC5C6\uC774 \uC228 \uC270\uB2E4 \u2014 \uC758\uAC00 \uB0B4\uACF5\uC758 \uC815\uC810.",
        school: "qigong",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [
          { artId: "uiga-hwalin-simbang", minSeong: 6 },
          { artId: "uiga-onyang-simbeop", minSeong: 5 }
        ]
      },
      // ─── 검(sword) 3 — 유엽검 → 호생검 → 제세검 ───
      {
        id: "uiga-yuyeop-sword",
        name: "\uC720\uC5FD\uAC80",
        hanjaName: "\u67F3\u8449\u528D",
        description: "\uBC84\uB4E4\uC78E\uCC98\uB7FC \uAC00\uBCCD\uACE0 \uBD80\uB4DC\uB7EC\uC6CC \uC0AC\uB78C\uC744 \uC0C1\uD558\uAC8C \uD558\uC9C0 \uC54A\uB294 \uC758\uAC00\uC758 \uC785\uBB38 \uAC80.",
        school: "sword",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest"
      },
      {
        id: "uiga-hosaeng-sword",
        name: "\uD638\uC0DD\uAC80",
        hanjaName: "\u8B77\u751F\u528D",
        description: "\uBAA9\uC228\uC744 \uC9C0\uD0A4\uB294 \uAC80 \u2014 \uBCA0\uAE30 \uC704\uD574\uC11C\uAC00 \uC544\uB2C8\uB77C \uC0B4\uB9AC\uAE30 \uC704\uD574 \uBF51\uB294\uB2E4.",
        school: "sword",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "uiga-yuyeop-sword", minSeong: 3 }]
      },
      {
        id: "uiga-jese-sword",
        name: "\uC81C\uC138\uAC80",
        hanjaName: "\u6FDF\u4E16\u528D",
        description: "\uD55C \uC790\uB8E8 \uAC80\uC73C\uB85C \uC138\uC0C1\uC758 \uC544\uD514\uC744 \uAC74\uC9C4\uB2E4\uB294 \uC758\uAC00 \uAC80\uC758 \uC815\uC218.",
        school: "sword",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "uiga-hosaeng-sword", minSeong: 5 }]
      },
      // ─── 보법(lightness) 3 — 채약보 → 답풍보 → 신행보 ───
      {
        id: "uiga-chaeyak-bo",
        name: "\uCC44\uC57D\uBCF4",
        hanjaName: "\u63A1\u85E5\u6B65",
        description: "\uC57D\uCD08\uB97C \uCE90\uB7EC \uBCBC\uB791\uACFC \uACE8\uC9DC\uAE30\uB97C \uD0C0\uB358 \uC758\uAC00\uC758 \uC0B0\uAE38 \uBCF4\uBC95.",
        school: "lightness",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "uiga-dappung-bo",
        name: "\uACBD\uC2E0\uC220",
        hanjaName: "\u8F15\u8EAB\u8853",
        description: "\uBC14\uB78C\uC744 \uBC1F\uB4EF \uAC00\uBCCD\uAC8C \uB0B4\uB2EC\uB824 \uC704\uAE09\uD55C \uD658\uC790\uC5D0\uAC8C \uB2FF\uB294 \uAC78\uC74C.",
        school: "lightness",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "uiga-chaeyak-bo", minSeong: 3 }]
      },
      {
        id: "uiga-sinhaeng-bo",
        name: "\uC2E0\uD589\uBCF4",
        hanjaName: "\u795E\u884C\u6B65",
        description: "\uADC0\uC2E0\uAC19\uC774 \uB0B4\uB2EB\uB294 \uAC78\uC74C \u2014 \uCC9C \uB9AC \uBC16 \uBAA9\uC228\uB3C4 \uB2A6\uC9C0 \uC54A\uAC8C \uB2FF\uB294\uB2E4.",
        school: "lightness",
        grade: "master",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "uiga-dappung-bo", minSeong: 5 }]
      },
      // ─── 권(fist) 2 — 오행권 → 금나수 ───
      {
        id: "uiga-ohaeng-gwon",
        name: "\uC624\uD589\uAD8C",
        hanjaName: "\u4E94\u884C\u62F3",
        description: "\uC624\uC7A5\uACFC \uC624\uD589\uC758 \uC774\uCE58\uB97C \uC8FC\uBA39\uC5D0 \uB2F4\uC740 \uC758\uAC00\uC758 \uC785\uBB38 \uAD8C\uBC95.",
        school: "fist",
        grade: "novice",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "uiga-yangsaeng-gyeol", minSeong: 3 }]
      },
      {
        id: "uiga-geumna-su",
        name: "\uC81C\uD608\uC218",
        hanjaName: "\u5236\u7A74\u624B",
        description: "\uAD00\uC808\uACFC \uD608\uC744 \uC7A1\uC544 \uAEBE\uC5B4 \uB2E4\uCE58\uC9C0 \uC54A\uAC8C \uC81C\uC555\uD558\uB294 \uC758\uAC00\uC758 \uC190 \uAE30\uC220.",
        school: "fist",
        grade: "apprentice",
        path: "jeong",
        isSectArt: false,
        lineage: "uiga",
        acquisition: "quest",
        prerequisites: [{ artId: "uiga-ohaeng-gwon", minSeong: 3 }]
      }
    ];
  }
});

// src/data/martialArts/catalog/salsu.ts
var SALSU_ARTS;
var init_salsu = __esm({
  "src/data/martialArts/catalog/salsu.ts"() {
    "use strict";
    SALSU_ARTS = [
      // ─── 암기(hidden) 10 — 비수술 뿌리, 수전·추혼 분기 → 절명십삼침 합류(기존 보존) ───
      {
        id: "salsu-bisu-sul",
        name: "\uBE44\uC218\uC220",
        hanjaName: "\u5315\u9996\u8853",
        description: "\uC18C\uB9E4 \uC18D \uD55C \uBF18 \uB2E8\uAC80\uC744 \uB2E4\uB8E8\uB294 \uC0B4\uC218\uC758 \uCCAB \uAE30\uC608.",
        school: "hidden",
        grade: "novice",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest"
      },
      {
        id: "salsu-sujeon-sul",
        name: "\uC218\uC804\uC220",
        hanjaName: "\u8896\u7BAD\u8853",
        description: "\uC18C\uB9F7\uC790\uB77D\uC5D0 \uC228\uAE34 \uC791\uC740 \uD654\uC0B4\uC744 \uC3D8\uC544 \uBCF4\uB0B4\uB294 \uC554\uAE30\uC758 \uAE30\uCD08.",
        school: "hidden",
        grade: "novice",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "salsu-bisu-sul", minSeong: 3 }]
      },
      {
        id: "salsu-monghan-yakbeop",
        name: "\uBABD\uD55C\uC57D\uBC95",
        hanjaName: "\u8499\u6C57\u85E5\u6CD5",
        description: "\uC220\uC794\uACFC \uD5A5\uC5D0 \uC7A0\uB4DC\uB294 \uC57D\uC744 \uC11E\uB294 \uBC95 \u2014 \uCE7C\uBCF4\uB2E4 \uC870\uC6A9\uD55C \uC0B4\uC218\uC758 \uC218\uB2E8.",
        school: "hidden",
        grade: "novice",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "salsu-bisu-sul", minSeong: 3 }]
      },
      {
        id: "salsu-museong-pyo",
        name: "\uBB34\uC131\uD45C",
        hanjaName: "\u7121\u8072\u93E2",
        description: "\uBC14\uB78C \uAC00\uB974\uB294 \uC18C\uB9AC\uC870\uCC28 \uC5C6\uC774 \uB0A0\uC544\uB4DC\uB294 \uC0B4\uC218\uC758 \uD45C\uCC3D\uC220.",
        school: "hidden",
        grade: "apprentice",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "salsu-sujeon-sul", minSeong: 3 }]
      },
      {
        id: "salsu-yau-bichim",
        name: "\uC57C\uC6B0\uBE44\uCE68",
        hanjaName: "\u591C\u96E8\u98DB\u91DD",
        description: "\uBC24\uBE44\uC5D0 \uC11E\uC5EC \uB5A8\uC5B4\uC9C0\uB294 \uAC00\uB294 \uCE68 \u2014 \uB9DE\uC740 \uC904\uB3C4 \uBAA8\uB974\uACE0 \uC4F0\uB7EC\uC9C4\uB2E4.",
        school: "hidden",
        grade: "apprentice",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "salsu-sujeon-sul", minSeong: 4 }]
      },
      {
        id: "salsu-chuhon-pyo",
        name: "\uD0C8\uBA85\uD45C",
        hanjaName: "\u596A\u547D\u93E2",
        description: "\uD55C \uBC88 \uB178\uB9B0 \uD63C\uC740 \uB05D\uAE4C\uC9C0 \uCAD3\uB294\uB2E4\uB294 \uC0B4\uC218\uC758 \uB3C5\uBB38 \uD45C\uCC3D.",
        school: "hidden",
        grade: "apprentice",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "salsu-bisu-sul", minSeong: 4 }]
      },
      {
        id: "salsu-talmyeong-bido",
        name: "\uD0C8\uBA85\uBE44\uB3C4",
        hanjaName: "\u596A\u547D\u98DB\u5200",
        description: "\uC190\uC744 \uB5A0\uB09C \uBE44\uB3C4 \uD55C \uC790\uB8E8\uAC00 \uC5B4\uAE40\uC5C6\uC774 \uBAA9\uC228\uC744 \uAC70\uB46C \uC628\uB2E4.",
        school: "hidden",
        grade: "master",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "salsu-museong-pyo", minSeong: 5 }]
      },
      {
        id: "salsu-hyeoljeokja",
        name: "\uD608\uC801\uC790",
        hanjaName: "\u8840\u6EF4\u5B50",
        description: "\uD5C8\uACF5\uC744 \uB0A0\uC544 \uBAA9\uC744 \uAC10\uC2F8 \uAC70\uB450\uB294 \uAE30\uD615 \uC554\uAE30 \u2014 \uB2E4\uB8E8\uB294 \uBC95\uC740 \uC0B4\uBB38 \uBC16\uC73C\uB85C \uC0C8\uC9C0 \uC54A\uB294\uB2E4.",
        school: "hidden",
        grade: "master",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "salsu-chuhon-pyo", minSeong: 5 }]
      },
      {
        id: "salsu-sippeop",
        name: "\uC0B4\uC218\uC2ED\uBC95",
        hanjaName: "\u6BBA\u624B\u5341\u6CD5",
        description: "\uC5F4 \uAC00\uC9C0 \uC8FD\uC774\uB294 \uBC95 \u2014 \uC0B4\uC218 \uC870\uC9C1\uC758 \uC815\uD1B5 \uAD50\uBCF8.",
        school: "hidden",
        grade: "master",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "eunsin-sul", minSeong: 5 }]
      },
      {
        id: "jeolmyeong-13-chim",
        name: "\uC808\uBA85\uC2ED\uC0BC\uCE68",
        hanjaName: "\u7D76\u547D\u5341\u4E09\u91DD",
        description: "\uC5F4\uC138 \uAC1C\uC758 \uCE68\uC774 \uBAA8\uB450 \uC808\uBA85\uC758 \uD608\uC744 \uB178\uB9B0\uB2E4. \uC0B4\uC218 \uBE44\uC804\uC758 \uC815\uC810.",
        school: "hidden",
        grade: "grandmaster",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [
          { artId: "salsu-sippeop", minSeong: 6 },
          { artId: "muyeong-geom", minSeong: 4 }
        ]
      },
      // ─── 검(sword) 6 — 야행검 뿌리, 무성·잔영 분기 → 무흔검 합류 ───
      {
        id: "salsu-yahaeng-sword",
        name: "\uC57C\uD589\uAC80",
        hanjaName: "\u591C\u884C\u528D",
        description: "\uB2EC\uB3C4 \uC5C6\uB294 \uBC24\uAE38\uC5D0\uC11C \uBCBC\uB824\uC9C4 \uC0B4\uC218\uC758 \uC785\uBB38 \uAC80.",
        school: "sword",
        grade: "novice",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest"
      },
      {
        id: "salsu-museong-sword",
        name: "\uBB34\uC131\uAC80",
        hanjaName: "\u7121\u8072\u528D",
        description: "\uCE7C\uC9D1 \uC18C\uB9AC\uB3C4 \uBC14\uB78C \uC18C\uB9AC\uB3C4 \uC5C6\uB2E4 \u2014 \uB4E4\uB838\uC744 \uB54C\uB294 \uC774\uBBF8 \uB05D\uB09C \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "salsu-yahaeng-sword", minSeong: 3 }]
      },
      {
        id: "salsu-janyeong-sword",
        name: "\uC794\uC601\uAC80",
        hanjaName: "\u6B98\u5F71\u528D",
        description: "\uBCA0\uACE0 \uC9C0\uB098\uAC04 \uC790\uB9AC\uC5D0 \uADF8\uB9BC\uC790\uB9CC \uD55C \uBC15\uC790 \uB2A6\uAC8C \uB0A8\uB294 \uCF8C\uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "salsu-yahaeng-sword", minSeong: 4 }]
      },
      {
        id: "muyeong-geom",
        name: "\uBB34\uC601\uAC80",
        hanjaName: "\u7121\u5F71\u528D",
        description: "\uADF8\uB9BC\uC790\uC870\uCC28 \uB0A8\uAE30\uC9C0 \uC54A\uB294 \uC0B4\uC218\uC758 \uAC80. \uBCF4\uC600\uC744 \uB54C\uB294 \uC774\uBBF8 \uB2A6\uB2E4.",
        school: "sword",
        grade: "master",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "eunsin-sul", minSeong: 4 }]
      },
      {
        id: "salsu-danhon-sword",
        name: "\uB2E8\uD63C\uAC80",
        hanjaName: "\u65B7\u9B42\u528D",
        description: "\uD55C \uD638\uD761\uC5D0 \uD63C\uC904\uC744 \uB04A\uB294\uB2E4\uB294 \uC0B4\uBB38\uC758 \uC0C1\uC2B9 \uAC80.",
        school: "sword",
        grade: "master",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "salsu-museong-sword", minSeong: 5 }]
      },
      {
        id: "salsu-muheun-sword",
        name: "\uBB34\uD754\uAC80",
        hanjaName: "\u7121\u75D5\u528D",
        description: "\uADF8\uB9BC\uC790\uB3C4 \uC18C\uB9AC\uB3C4 \uC790\uAD6D\uB3C4 \uC5C6\uB2E4 \u2014 \uC0B4\uC218 \uAC80\uC758 \uC815\uC810, \uAC80\uC774 \uC9C0\uB098\uAC04 \uC77C\uC870\uCC28 \uC9C0\uC6B4\uB2E4.",
        school: "sword",
        grade: "grandmaster",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [
          { artId: "muyeong-geom", minSeong: 6 },
          { artId: "salsu-danhon-sword", minSeong: 5 }
        ]
      },
      // ─── 보법(lightness) 8 — 잠행술·벽호공 뿌리, 야행·무음 분기 → 무영신법 합류 ───
      {
        id: "salsu-jamhaeng-sul",
        name: "\uC7A0\uD589\uC220",
        hanjaName: "\u6F5B\u884C\u8853",
        description: "\uC228\uC8FD\uC5EC \uC2A4\uBA70\uB4DC\uB294 \uBC95 \u2014 \uB2F4 \uADF8\uB298\uACFC \uCC98\uB9C8 \uBC11\uC774 \uC0B4\uC218\uC758 \uAE38\uC774 \uB41C\uB2E4.",
        school: "lightness",
        grade: "novice",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "salsu-byeokho-gong",
        name: "\uBCBD\uD638\uACF5",
        hanjaName: "\u58C1\u864E\u529F",
        description: "\uB3C4\uB9C8\uBC40\uBD99\uC774\uCC98\uB7FC \uB9E8\uC190\uC73C\uB85C \uB2F4\uBCBC\uB77D\uACFC \uC808\uBCBD\uC744 \uD0C0\uB294 \uAE30\uC608.",
        school: "lightness",
        grade: "novice",
        path: "jung",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "eunsin-sul",
        name: "\uC740\uC2E0\uC220",
        hanjaName: "\u96B1\u8EAB\u8853",
        description: "\uC5B4\uB460\uACFC \uD55C \uBAB8\uC774 \uB418\uB294 \uC0B4\uC218\uC758 \uAE30\uCD08. \uAE30\uCC99\uC744 \uC9C0\uC6B4\uB2E4.",
        school: "lightness",
        grade: "apprentice",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest"
      },
      {
        id: "salsu-yahaeng-sul",
        name: "\uC57C\uD589\uC220",
        hanjaName: "\u591C\u884C\u8853",
        description: "\uBC24\uC744 \uB0AE\uCC98\uB7FC \uB0B4\uB2EC\uB9AC\uB294 \uC0B4\uC218\uC758 \uC57C\uAC04 \uD589\uBCF4\uC220.",
        school: "lightness",
        grade: "apprentice",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "salsu-jamhaeng-sul", minSeong: 3 }]
      },
      {
        id: "salsu-mueum-bo",
        name: "\uBB34\uC74C\uBCF4",
        hanjaName: "\u7121\u97F3\u6B65",
        description: "\uB9C8\uB978 \uB099\uC5FD \uC704\uB97C \uAC78\uC5B4\uB3C4 \uC18C\uB9AC \uD558\uB098 \uB0B4\uC9C0 \uC54A\uB294 \uAC78\uC74C.",
        school: "lightness",
        grade: "apprentice",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "salsu-jamhaeng-sul", minSeong: 3 }]
      },
      {
        id: "salsu-hwanyeong-bo",
        name: "\uD658\uC601\uBCF4",
        hanjaName: "\u5E7B\u5F71\u6B65",
        description: "\uB208\uC55E\uC758 \uBAA8\uC2B5\uC774 \uD5C8\uAE68\uBE44\uAC00 \uB418\uB294 \uBCF4\uBC95 \u2014 \uBCA0\uC778 \uAC83\uC740 \uC794\uC0C1\uBFD0\uC774\uB2E4.",
        school: "lightness",
        grade: "master",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "salsu-yahaeng-sul", minSeong: 5 }]
      },
      {
        id: "salsu-amyeong-sinbeop",
        name: "\uC554\uC601\uC2E0\uBC95",
        hanjaName: "\u6697\u5F71\u8EAB\u6CD5",
        description: "\uC5B4\uB460\uC758 \uADF8\uB9BC\uC790 \uC18D\uC73C\uB85C \uBAB8\uC744 \uC811\uC5B4 \uB123\uB294 \uC0B4\uBB38\uC758 \uC0C1\uC2B9 \uC2E0\uBC95.",
        school: "lightness",
        grade: "master",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "salsu-mueum-bo", minSeong: 5 }]
      },
      {
        id: "salsu-muyeong-sinbeop",
        name: "\uBB34\uC601\uC2E0\uBC95",
        hanjaName: "\u7121\u5F71\u8EAB\u6CD5",
        description: "\uADF8\uB9BC\uC790\uB9C8\uC800 \uB450\uACE0 \uC6C0\uC9C1\uC778\uB2E4 \u2014 \uD658\uC601\uACFC \uC554\uC601\uC774 \uD558\uB098\uB85C \uB179\uC740 \uC0B4\uC218 \uC2E0\uBC95\uC758 \uC815\uC810.",
        school: "lightness",
        grade: "grandmaster",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [
          { artId: "salsu-hwanyeong-bo", minSeong: 6 },
          { artId: "salsu-amyeong-sinbeop", minSeong: 5 }
        ]
      },
      // ─── 심법(qigong) 4 — 살심결 뿌리 → 빙심결 → 한월신공 (귀식대법은 곁가지) ───
      {
        id: "salsu-salsim-gyeol",
        name: "\uC0B4\uC2EC\uACB0",
        hanjaName: "\u6BBA\u5FC3\u8A23",
        description: "\uB5A8\uB9AC\uB294 \uC190\uACFC \uB9DD\uC124\uC774\uB294 \uB9C8\uC74C\uC744 \uC8FD\uC774\uB294 \uC0B4\uC218\uC758 \uC785\uBB38 \uAD6C\uACB0.",
        school: "qigong",
        grade: "novice",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest"
      },
      {
        id: "gwisik-daebeop",
        name: "\uADC0\uC2DD\uB300\uBC95",
        hanjaName: "\u9F9C\u606F\u5927\u6CD5",
        description: "\uC228\uACFC \uB9E5\uC744 \uC8FD\uC5EC \uC2DC\uCCB4\uCC98\uB7FC \uC228\uB294 \uC7A0\uBCF5\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest"
      },
      {
        id: "salsu-bingsim-gyeol",
        name: "\uBE59\uBC31\uACB0",
        hanjaName: "\u6C37\u9B44\u8A23",
        description: "\uC2EC\uC7A5\uC744 \uC5BC\uC74C\uC73C\uB85C \uBE5A\uB294\uB2E4 \u2014 \uD45C\uC801 \uC55E\uC5D0\uC11C \uB9E5\uBC15\uC870\uCC28 \uD750\uD2B8\uB7EC\uC9C0\uC9C0 \uC54A\uB294\uB2E4.",
        school: "qigong",
        grade: "apprentice",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "salsu-salsim-gyeol", minSeong: 4 }]
      },
      {
        id: "salsu-hanwol-singong",
        name: "\uD55C\uC6D4\uC2E0\uACF5",
        hanjaName: "\u5BD2\u6708\u795E\u529F",
        description: "\uCC2C \uB2EC\uBE5B\uCC98\uB7FC \uCC28\uACE0 \uC2DC\uB9B0 \uB0B4\uB825\uC744 \uC313\uB294 \uC0B4\uBB38 \uCD5C\uACE0\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "grandmaster",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "salsu-bingsim-gyeol", minSeong: 7 }]
      },
      // ─── 도(saber) 2 — 야월도 → 귀곡도 ───
      {
        id: "salsu-yawol-do",
        name: "\uC57C\uC6D4\uB3C4",
        hanjaName: "\u591C\u6708\u5200",
        description: "\uBC24\uD558\uB298\uC758 \uC870\uAC01\uB2EC\uCC98\uB7FC \uB0AE\uAC8C \uB5A0\uC11C \uBCA0\uB294 \uC0B4\uC218\uC758 \uB2E8\uB3C4\uC220.",
        school: "saber",
        grade: "apprentice",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "salsu-bisu-sul", minSeong: 4 }]
      },
      {
        id: "salsu-gwigok-do",
        name: "\uADC0\uACE1\uB3C4",
        hanjaName: "\u9B3C\u54ED\u5200",
        description: "\uB3C4\uAC00 \uC6B8\uBA74 \uADC0\uC2E0\uC774 \uACE1\uD55C\uB2E4 \u2014 \uC0B4\uBB38\uC5D0 \uC804\uD558\uB294 \uC0C1\uC2B9 \uB3C4\uBC95.",
        school: "saber",
        grade: "master",
        path: "sa",
        isSectArt: false,
        lineage: "salsu",
        acquisition: "quest",
        prerequisites: [{ artId: "salsu-yawol-do", minSeong: 5 }]
      }
    ];
  }
});

// src/data/martialArts/catalog/sapa.ts
var SAPA_ARTS;
var init_sapa = __esm({
  "src/data/martialArts/catalog/sapa.ts"() {
    "use strict";
    SAPA_ARTS = [
      // ─── 도(saber) 10 — 녹림도법 → 야랑도/독아도법/야차도 → 흑살도·혈랑도 → 백귀야행도, 귀수도 → 귀영도법/혈풍도 ───
      {
        id: "sapa-nokrim-dobeop",
        name: "\uB179\uB9BC\uB3C4\uBC95",
        hanjaName: "\u7DA0\u6797\u5200\u6CD5",
        description: "\uC0B0\uCC44\uC640 \uAD00\uB3C4\uB97C \uC624\uAC00\uBA70 \uB2E4\uC838\uC9C4 \uB179\uB9BC\uB3C4\uC758 \uC785\uBB38 \uB3C4\uBC95. \uD22C\uBC15\uD558\uB098 \uC0AC\uB78C\uC744 \uBCA0\uC5B4\uBCF8 \uCE7C\uC774\uB2E4.",
        school: "saber",
        grade: "novice",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest"
      },
      {
        id: "sapa-yarang-do",
        name: "\uC57C\uB791\uB3C4",
        hanjaName: "\u591C\u72FC\u5200",
        description: "\uBC24\uC774\uC2AC\uC744 \uB9DE\uC73C\uBA70 \uC0AC\uB0E5\uD558\uB294 \uC774\uB9AC\uCC98\uB7FC \uB0AE\uACE0 \uBE60\uB974\uAC8C \uBCA0\uB294 \uB3C4\uBC95.",
        school: "saber",
        grade: "novice",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "sapa-nokrim-dobeop", minSeong: 3 }]
      },
      {
        id: "sapa-doga-dobeop",
        name: "\uB3C5\uC544\uB3C4\uBC95",
        hanjaName: "\u6BD2\u7259\u5200\u6CD5",
        description: "\uB3C5\uC0AC\uC758 \uC1A1\uACF3\uB2C8\uCC98\uB7FC \uD55C \uC810\uB9CC \uB178\uB824 \uD30C\uACE0\uB4DC\uB294 \uC0AC\uD30C\uC758 \uB3C4\uBC95.",
        school: "saber",
        grade: "apprentice",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "sapa-nokrim-dobeop", minSeong: 3 }]
      },
      {
        id: "sapa-yacha-do",
        name: "\uC57C\uCC28\uB3C4",
        hanjaName: "\u591C\u53C9\u5200",
        description: "\uC57C\uCC28\uAC00 \uD718\uB450\uB974\uB4EF \uD749\uD749\uD55C \uCE7C\uBC14\uB78C\uC73C\uB85C \uBA3C\uC800 \uC0C1\uB300\uC758 \uAC04\uB2F4\uC744 \uAEBE\uB294 \uBCC0\uCE59 \uB3C4\uBC95.",
        school: "saber",
        grade: "apprentice",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "sapa-yarang-do", minSeong: 3 }]
      },
      {
        id: "gwisu-do",
        name: "\uADC0\uC218\uB3C4",
        hanjaName: "\u9B3C\u624B\u5200",
        description: "\uADC0\uC2E0 \uC190\uC774 \uC2A4\uCE58\uB4EF \uBCC0\uCE59\uC801\uC778 \uC0AC\uD30C\uC758 \uB3C4\uBC95.",
        school: "saber",
        grade: "apprentice",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest"
      },
      {
        id: "sapa-heuksal-do",
        name: "\uD751\uC0B4\uB3C4",
        hanjaName: "\u9ED1\u715E\u5200",
        description: "\uAC80\uC740 \uC0B4\uAE30\uB97C \uCE7C\uB0A0\uC5D0 \uC5B9\uB294 \uC0AC\uD30C \uC0C1\uC2B9 \uB3C4\uBC95. \uBCA0\uAE30 \uC804\uC5D0 \uC774\uBBF8 \uAE30\uC138\uB85C \uB204\uB978\uB2E4.",
        school: "saber",
        grade: "master",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "sapa-doga-dobeop", minSeong: 5 }]
      },
      {
        id: "sapa-hyeollang-do",
        name: "\uD608\uB791\uB3C4",
        hanjaName: "\u8840\u72FC\u5200",
        description: "\uD53C \uB9DB\uC744 \uBCF8 \uC774\uB9AC \uB5BC\uCC98\uB7FC \uC274 \uC0C8 \uC5C6\uC774 \uBAB0\uC544\uCE58\uB294 \uC5F0\uD658\uC758 \uB3C4\uBC95.",
        school: "saber",
        grade: "master",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "sapa-yacha-do", minSeong: 5 }]
      },
      {
        id: "sapa-gwiyeong-dobeop",
        name: "\uADC0\uC601\uB3C4\uBC95",
        hanjaName: "\u9B3C\u5F71\u5200\u6CD5",
        description: "\uADC0\uC2E0 \uADF8\uB9BC\uC790\uAC00 \uC5B4\uB978\uAC70\uB9AC\uB4EF \uC885\uC7A1\uC744 \uC218 \uC5C6\uB294 \uC0AC\uD30C \uC0C1\uC2B9 \uB3C4\uBC95.",
        school: "saber",
        grade: "master",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "gwisu-do", minSeong: 5 }]
      },
      {
        id: "hyeolpung-do",
        name: "\uD608\uD48D\uB3C4",
        hanjaName: "\u8840\u98A8\u5200",
        description: "\uD53C\uBC14\uB78C\uC744 \uBD80\uB978\uB2E4\uB294 \uC0AC\uD30C \uB3C4\uBC95\uC758 \uC815\uC810. \uD55C \uC790\uB8E8 \uB3C4\uAC00 \uBC31 \uBA85\uC758 \uAE38\uC744 \uB9C9\uB294\uB2E4.",
        school: "saber",
        grade: "grandmaster",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "gwisu-do", minSeong: 6 }]
      },
      {
        id: "sapa-baekgwi-yahaengdo",
        name: "\uBC31\uADC0\uC57C\uD589\uB3C4",
        hanjaName: "\u767E\u9B3C\u591C\u884C\u5200",
        description: "\uBC31 \uADC0\uC2E0\uC774 \uBC24\uAE38\uC744 \uC4F8 \uB4EF \uD55C \uC790\uB8E8 \uB3C4\uAC00 \uC0AC\uBC29\uC744 \uB3D9\uC2DC\uC5D0 \uB36E\uB294 \uC0AC\uD30C \uB3C4\uBC95\uC758 \uC815\uC810.",
        school: "saber",
        grade: "grandmaster",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [
          { artId: "sapa-heuksal-do", minSeong: 5 },
          { artId: "sapa-hyeollang-do", minSeong: 5 }
        ]
      },
      // ─── 검(sword) 8 — 독사검법 → 귀명검/암야검/귀무검 → 혈사검법, 음풍검 → 수라검법 → 혈하검법 ───
      {
        id: "sapa-doksa-geombeop",
        name: "\uB3C5\uC0AC\uAC80\uBC95",
        hanjaName: "\u6BD2\u86C7\u528D\u6CD5",
        description: "\uB3C5\uC0AC\uAC00 \uD480\uC232\uC744 \uAE30\uB4EF \uB0AE\uAC8C \uD750\uB974\uB2E4 \uB2E8\uC228\uC5D0 \uBB34\uB294 \uC0AC\uD30C\uC758 \uC785\uBB38 \uAC80.",
        school: "sword",
        grade: "novice",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest"
      },
      {
        id: "sapa-gwimyeong-sword",
        name: "\uADC0\uBA85\uAC80",
        hanjaName: "\u9B3C\u9CF4\u528D",
        description: "\uADC0\uACE1\uC131\uCC98\uB7FC \uC6B0\uB294 \uAC80\uBA85\uC73C\uB85C \uC0C1\uB300\uC758 \uC815\uC2E0\uC744 \uD754\uB4DC\uB294 \uAC80.",
        school: "sword",
        grade: "novice",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "sapa-doksa-geombeop", minSeong: 3 }]
      },
      {
        id: "eumpung-sword",
        name: "\uC74C\uD48D\uAC80",
        hanjaName: "\u9670\u98A8\u528D",
        description: "\uC74C\uC2B5\uD55C \uBC14\uB78C\uCC98\uB7FC \uB0AE\uAC8C \uD30C\uACE0\uB4DC\uB294 \uC0AC\uD30C\uC758 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest"
      },
      {
        id: "sapa-amya-sword",
        name: "\uC554\uC57C\uAC80",
        hanjaName: "\u6697\u591C\u528D",
        description: "\uB2EC\uB3C4 \uC5C6\uB294 \uBC24\uCC98\uB7FC \uBCF4\uC774\uC9C0 \uC54A\uB294 \uACF3\uC5D0\uC11C \uCC0C\uB974\uB294 \uC0AC\uD30C\uC758 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "sapa-doksa-geombeop", minSeong: 3 }]
      },
      {
        id: "sapa-gwimu-sword",
        name: "\uADC0\uBB34\uAC80",
        hanjaName: "\u9B3C\u821E\u528D",
        description: "\uADC0\uC2E0\uC774 \uCDA4\uCD94\uB4EF \uC5B4\uC9C0\uB7EC\uC6B4 \uBCC0\uCD08\uB85C \uC0C1\uB300\uC758 \uB208\uC744 \uC18D\uC774\uB294 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "sapa-gwimyeong-sword", minSeong: 3 }]
      },
      {
        id: "sura-geombeop",
        name: "\uC218\uB77C\uAC80\uBC95",
        hanjaName: "\u4FEE\u7F85\u528D\u6CD5",
        description: "\uC218\uB77C\uC7A5\uC758 \uD55C\uBCF5\uD310\uC5D0\uC11C \uD0DC\uC5B4\uB09C \uAC80. \uC8FD\uACE0 \uC8FD\uC774\uB294 \uB370\uB9CC \uCDA9\uC2E4\uD558\uB2E4.",
        school: "sword",
        grade: "master",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "eumpung-sword", minSeong: 5 }]
      },
      {
        id: "sapa-hyeolsa-geombeop",
        name: "\uD608\uC0AC\uAC80\uBC95",
        hanjaName: "\u8840\u86C7\u528D\u6CD5",
        description: "\uD53C \uBB3B\uC740 \uBC40\uC774 \uD718\uAC10\uB4EF \uB048\uC9C8\uAE30\uAC8C \uC5BD\uC5B4 \uBCA0\uB294 \uC0AC\uD30C \uC0C1\uC2B9 \uAC80.",
        school: "sword",
        grade: "master",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "sapa-amya-sword", minSeong: 5 }]
      },
      {
        id: "sapa-hyeolha-geombeop",
        name: "\uD608\uD558\uAC80\uBC95",
        hanjaName: "\u8840\u6CB3\u528D\u6CD5",
        description: "\uAC80\uC774 \uC9C0\uB098\uAC04 \uC790\uB9AC\uAC00 \uD54F\uBE5B \uAC15\uC774 \uB41C\uB2E4\uB294 \uC0AC\uD30C \uAC80\uD559\uC758 \uC815\uC810.",
        school: "sword",
        grade: "grandmaster",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "sura-geombeop", minSeong: 6 }]
      },
      // ─── 권(fist) 8 — 흑호권 → 낭조수/철사장/귀왕권 → 혈조수, 낭아권 → 흑풍권 ⇒ 흑천패권(합류) ───
      {
        id: "sapa-heukho-gwon",
        name: "\uD751\uD638\uAD8C",
        hanjaName: "\u9ED1\u864E\u62F3",
        description: "\uAC80\uC740 \uD638\uB791\uC774\uAC00 \uBA39\uC774\uB97C \uB36E\uCE58\uB4EF \uC0AC\uB0A9\uAC8C \uBAB0\uC544\uBD99\uC774\uB294 \uC0AC\uD30C\uC758 \uC785\uBB38 \uAD8C\uBC95.",
        school: "fist",
        grade: "novice",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest"
      },
      {
        id: "sapa-nangjo-su",
        name: "\uB0AD\uC870\uC218",
        hanjaName: "\u72FC\u722A\u624B",
        description: "\uC774\uB9AC \uBC1C\uD1B1\uCC98\uB7FC \uD560\uD034\uACE0 \uCC22\uB294 \uC190\uC18D. \uC0AC\uD30C \uC218\uACF5\uC758 \uAE30\uCD08.",
        school: "fist",
        grade: "novice",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "sapa-heukho-gwon", minSeong: 3 }]
      },
      {
        id: "nanga-gwon",
        name: "\uB0AD\uC544\uAD8C",
        hanjaName: "\u72FC\u7259\u62F3",
        description: "\uC774\uB9AC \uC774\uBE68\uCC98\uB7FC \uBB3C\uC5B4\uB72F\uB294 \uC0AC\uD30C\uC758 \uC785\uBB38 \uAD8C\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest"
      },
      {
        id: "sapa-cheolsa-jang",
        name: "\uD751\uC0AC\uC7A5",
        hanjaName: "\u9ED1\u7802\u638C",
        description: "\uCCA0 \uBAA8\uB798\uC5D0 \uC190\uC744 \uB2E8\uB828\uD574 \uC7A5\uB825\uC5D0 \uC1F3\uB0B4\uB97C \uC2E3\uB294 \uC218\uACF5.",
        school: "fist",
        grade: "apprentice",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "sapa-heukho-gwon", minSeong: 3 }]
      },
      {
        id: "sapa-gwiwang-gwon",
        name: "\uADC0\uC655\uAD8C",
        hanjaName: "\u9B3C\u738B\u62F3",
        description: "\uADC0\uC655\uC758 \uD615\uC0C1\uC744 \uBCF8\uB5B4\uB2E4\uB294 \uD749\uB9F9\uD55C \uAD8C\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "sapa-nangjo-su", minSeong: 3 }]
      },
      {
        id: "heukpung-fist",
        name: "\uD751\uD48D\uAD8C",
        hanjaName: "\u9ED1\u98A8\u62F3",
        description: "\uAC70\uCE60\uACE0 \uB9E4\uC11C\uC6B4 \uC0AC\uD30C \uAD8C\uBC95. \uBE60\uB978 \uC0B4\uC218\uC5D0 \uB2A5\uD558\uB098 \uACB0\uC774 \uC5B4\uB461\uB2E4.",
        school: "fist",
        grade: "master",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "nanga-gwon", minSeong: 4 }]
      },
      {
        id: "sapa-hyeoljo-su",
        name: "\uD608\uC870\uC218",
        hanjaName: "\u8840\u722A\u624B",
        description: "\uBC1C\uD1B1\uC774 \uC2A4\uCE5C \uC790\uB9AC\uB9C8\uB2E4 \uD53C\uAC00 \uB9FA\uD78C\uB2E4\uB294 \uC0AC\uD30C \uC0C1\uC2B9 \uC218\uACF5.",
        school: "fist",
        grade: "master",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "sapa-gwiwang-gwon", minSeong: 5 }]
      },
      {
        id: "sapa-heukcheon-paegwon",
        name: "\uD751\uCC9C\uD328\uAD8C",
        hanjaName: "\u9ED1\u5929\u9738\u62F3",
        description: "\uAC80\uC740 \uD558\uB298 \uC544\uB798 \uD640\uB85C \uD328\uC790\uAC00 \uB41C\uB2E4\uB294 \uC0AC\uD30C \uAD8C\uD559\uC758 \uC815\uC810.",
        school: "fist",
        grade: "grandmaster",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [
          { artId: "heukpung-fist", minSeong: 5 },
          { artId: "sapa-hyeoljo-su", minSeong: 5 }
        ]
      },
      // ─── 심법(qigong) 2 — 녹림심법 → 현음공 ───
      {
        id: "sapa-nokrim-simbeop",
        name: "\uB179\uB9BC\uC2EC\uBC95",
        hanjaName: "\u7DA0\u6797\u5FC3\u6CD5",
        description: "\uC0B0\uCC44\uC5D0\uC11C \uC785\uC5D0\uC11C \uC785\uC73C\uB85C \uC804\uD55C \uAC70\uCE5C \uD638\uD761\uBC95. \uBE60\uB974\uAC8C \uB053\uACE0 \uBE60\uB974\uAC8C \uC2DD\uB294\uB2E4.",
        school: "qigong",
        grade: "novice",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest"
      },
      {
        id: "sapa-hyeoneum-gong",
        name: "\uD604\uC74C\uACF5",
        hanjaName: "\u7384\u9670\u529F",
        description: "\uADF8\uB298\uC9C4 \uAE30\uC6B4\uC744 \uB2E8\uC804\uC5D0 \uAC00\uB77C\uC549\uD788\uB294 \uC0AC\uD30C\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "sapa-nokrim-simbeop", minSeong: 3 }]
      },
      // ─── 보법(lightness) 2 — 초상비 → 암행술 → 무영보 ───
      {
        id: "sapa-amhaeng-sul",
        name: "\uC554\uD589\uC220",
        hanjaName: "\u6697\u884C\u8853",
        description: "\uB2EC\uBE5B\uC744 \uB4F1\uC9C0\uACE0 \uC18C\uB9AC \uC5C6\uC774 \uB0B4\uB2EB\uB294 \uBC24\uAE38\uC758 \uACBD\uC2E0\uC220.",
        school: "lightness",
        grade: "novice",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }]
      },
      {
        id: "sapa-muyeong-bo",
        name: "\uBB34\uC601\uBCF4",
        hanjaName: "\u7121\u5F71\u6B65",
        description: "\uADF8\uB9BC\uC790\uC870\uCC28 \uB530\uB77C\uC7A1\uC9C0 \uBABB\uD55C\uB2E4\uB294 \uC0AC\uD30C \uBCF4\uBC95\uC758 \uC815\uC218.",
        school: "lightness",
        grade: "master",
        path: "sa",
        isSectArt: false,
        lineage: "sapa",
        acquisition: "quest",
        prerequisites: [{ artId: "sapa-amhaeng-sul", minSeong: 5 }]
      }
    ];
  }
});

// src/data/martialArts/catalog/magyo.ts
var MAGYO_ARTS;
var init_magyo = __esm({
  "src/data/martialArts/catalog/magyo.ts"() {
    "use strict";
    MAGYO_ARTS = [
      // ─── 마공(darkArts) 14 — 섭혼술 → 미혼술/마안술/수라마공 → 화공대법 → 흡성대법,
      //     역혈공 → 마염공 → 멸혼마공, 마안술 → 암천마공 → 수라음살공, 흑풍권 → 혈마공 → 천마비전 ───
      {
        id: "seophon-sul",
        name: "\uC12D\uD63C\uC220",
        hanjaName: "\u651D\u9B42\u8853",
        description: "\uB208\uC744 \uB9C8\uC8FC\uCE5C \uC790\uC758 \uB10B\uC744 \uD754\uB4DC\uB294 \uB9C8\uAD50 \uC785\uBB38 \uC220\uBC95. \uB9C8\uC74C\uC758 \uADF8\uB298\uC774 \uAE4A\uC744\uC218\uB85D \uC798 \uBA39\uD78C\uB2E4.",
        school: "darkArts",
        grade: "novice",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        minDarkness: 1
      },
      {
        id: "magyo-yeokhyeol-gong",
        name: "\uC5ED\uD608\uACF5",
        hanjaName: "\u9006\u8840\u529F",
        description: "\uD53C\uC758 \uD750\uB984\uC744 \uAC70\uAFB8\uB85C \uB3CC\uB824 \uD798\uC744 \uB04C\uC5B4\uB0B4\uB294 \uC785\uBB38 \uB9C8\uACF5. \uC5ED\uCC9C\uC758 \uCCAB \uBB38\uD131.",
        school: "darkArts",
        grade: "novice",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        minDarkness: 1
      },
      {
        id: "magyo-maan-sul",
        name: "\uB9C8\uC548\uC220",
        hanjaName: "\u9B54\u773C\u8853",
        description: "\uB9C8\uAE30\uB97C \uB208\uC5D0 \uBAA8\uC544 \uB9C8\uC8FC\uCE5C \uC790\uB97C \uC62D\uC544\uB9E4\uB294 \uC220\uBC95.",
        school: "darkArts",
        grade: "novice",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "seophon-sul", minSeong: 3 }],
        minDarkness: 1
      },
      {
        id: "mihon-sul",
        name: "\uBBF8\uD63C\uC220",
        hanjaName: "\u8FF7\u9B42\u8853",
        description: "\uD5A5\uACFC \uC74C\uB960, \uB208\uBE5B\uC73C\uB85C \uC815\uC2E0\uC744 \uD640\uB824 \uAE38\uC744 \uC783\uAC8C \uD55C\uB2E4. \uC12D\uD63C\uC758 \uACB0\uC774 \uD55C\uCE35 \uAE4A\uC5B4\uC9C4 \uC220\uBC95.",
        school: "darkArts",
        grade: "apprentice",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "seophon-sul", minSeong: 3 }],
        minDarkness: 1
      },
      {
        id: "magyo-mayeom-gong",
        name: "\uB9C8\uC5FC\uACF5",
        hanjaName: "\u9B54\u7130\u529F",
        description: "\uAC80\uC740 \uBD88\uAF43\uCC98\uB7FC \uC77C\uB801\uC774\uB294 \uB9C8\uAE30\uB97C \uC190\uB05D\uC5D0 \uD53C\uC6B0\uB294 \uB9C8\uACF5.",
        school: "darkArts",
        grade: "apprentice",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "magyo-yeokhyeol-gong", minSeong: 3 }],
        minDarkness: 1
      },
      {
        id: "magyo-amcheon-magong",
        name: "\uC554\uCC9C\uB9C8\uACF5",
        hanjaName: "\u6697\u5929\u9B54\u529F",
        description: "\uD558\uB298\uBE5B\uB9C8\uC800 \uC5B4\uB461\uAC8C \uAC00\uB77C\uC549\uD78C\uB2E4\uB294 \uB9C8\uACF5. \uC5B4\uB460\uC774 \uAE4A\uC744\uC218\uB85D \uAC15\uD574\uC9C4\uB2E4.",
        school: "darkArts",
        grade: "apprentice",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "magyo-maan-sul", minSeong: 3 }],
        minDarkness: 1
      },
      {
        id: "sura-magong",
        name: "\uC218\uB77C\uB9C8\uACF5",
        hanjaName: "\u4FEE\u7F85\u9B54\u529F",
        description: "\uBD84\uB178\uC640 \uC0B4\uAE30\uB97C \uC5F0\uB8CC\uB85C \uD0DC\uC6B0\uB294 \uC785\uBB38 \uB9C8\uACF5. \uB9C8\uC74C\uC758 \uADF8\uB298\uC774 \uC788\uC5B4\uC57C \uBC1B\uC544\uB4E4\uC77C \uC218 \uC788\uB2E4.",
        school: "darkArts",
        grade: "master",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "seophon-sul", minSeong: 3 }],
        minDarkness: 1
      },
      {
        id: "hwagong-daebeop",
        name: "\uD654\uACF5\uB300\uBC95",
        hanjaName: "\u5316\u529F\u5927\u6CD5",
        description: "\uB2FF\uC740 \uC790\uC758 \uB0B4\uACF5\uC744 \uBB3C\uCC98\uB7FC \uB179\uC5EC \uD769\uB294\uB2E4. \uD761\uC131\uB300\uBC95\uC73C\uB85C \uAC00\uB294 \uAE38\uBAA9\uC758 \uAE08\uACF5(\u7981\u529F).",
        school: "darkArts",
        grade: "master",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "sura-magong", minSeong: 4 }],
        minDarkness: 2,
        traits: ["drain"]
        // 내공 소멸(흡성으로 가는 길목) — 엔진상 흡공으로 근사(적 내공을 깎는다).
      },
      {
        id: "sosu-magong",
        name: "\uC18C\uC218\uB9C8\uACF5",
        hanjaName: "\u7D20\u624B\u9B54\u529F",
        description: "\uD76C\uACE0 \uACE0\uC6B4 \uB9E8\uC190\uC774 \uB2FF\uB294 \uAC83\uB9C8\uB2E4 \uC2DC\uB4E4\uAC8C \uD55C\uB2E4. \uC7A5\uBC95\uACFC \uC220\uBC95\uC774 \uD55C\uB370 \uB179\uC740 \uB9C8\uAD50\uC758 \uC808\uD559.",
        school: "darkArts",
        grade: "master",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [
          { artId: "seophon-sul", minSeong: 4 },
          { artId: "hwagol-myeonjang", minSeong: 5 }
        ],
        minDarkness: 2
      },
      {
        id: "magyo-myeolhon-magong",
        name: "\uBA78\uD63C\uB9C8\uACF5",
        hanjaName: "\u6EC5\u9B42\u9B54\u529F",
        description: "\uD63C\uBC31\uC744 \uC9C0\uC6CC\uBC84\uB9B0\uB2E4\uB294 \uAE08\uB2E8\uC758 \uB9C8\uACF5. \uB9DE\uC740 \uC790\uB294 \uC815\uC2E0\uBD80\uD130 \uBB34\uB108\uC9C4\uB2E4.",
        school: "darkArts",
        grade: "master",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "magyo-mayeom-gong", minSeong: 5 }],
        minDarkness: 2
      },
      {
        id: "magyo-sura-eumsal-gong",
        name: "\uC218\uB77C\uC74C\uC0B4\uACF5",
        hanjaName: "\u4FEE\u7F85\u9670\u715E\u529F",
        description: "\uC218\uB77C\uC758 \uC0B4\uAE30\uC640 \uC74C\uD55C \uAE30\uC6B4\uC744 \uD55C\uB370 \uBE5A\uC740 \uB9C8\uAD50\uC758 \uC808\uD559.",
        school: "darkArts",
        grade: "master",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "magyo-amcheon-magong", minSeong: 5 }],
        minDarkness: 2
      },
      {
        id: "hyeolma-gong",
        name: "\uD608\uB9C8\uACF5",
        hanjaName: "\u8840\u9B54\u529F",
        description: "\uD53C\uB85C \uAE30\uB97C \uAE30\uB974\uB294 \uB9C8\uAD50 \uBE44\uC804. \uD3ED\uBC1C\uC801 \uC131\uC7A5\uC758 \uB300\uAC00\uB85C \uC778\uACA9\uC744 \uAC09\uB294\uB2E4.",
        school: "darkArts",
        grade: "grandmaster",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "heukpung-fist", minSeong: 5 }],
        minDarkness: 2
      },
      {
        id: "cheonma-bijeon",
        name: "\uCC9C\uB9C8\uBE44\uC804",
        hanjaName: "\u5929\u9B54\u79D8\u50B3",
        description: "\uCC9C\uB9C8\uC2E0\uACF5\uC73C\uB85C \uAC00\uB294 \uAE38\uBAA9\uC758 \uBE44\uC804. \uAE4A\uC740 \uC5B4\uB460\uC5D0 \uB4E0 \uC790\uB9CC\uC774 \uD3BC\uCE60 \uC218 \uC788\uB2E4.",
        school: "darkArts",
        grade: "grandmaster",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "hyeolma-gong", minSeong: 7 }],
        minDarkness: 3
      },
      {
        id: "heupseong-daebeop",
        name: "\uD761\uC131\uB300\uBC95",
        hanjaName: "\u5438\u661F\u5927\u6CD5",
        description: "\uD0C0\uC778\uC758 \uB0B4\uACF5\uC744 \uBE68\uC544\uB4E4\uC774\uB294 \uAE08\uB2E8\uC758 \uB9C8\uACF5. \uC774\uC885\uC9C4\uAE30\uAC00 \uCDA9\uB3CC\uD558\uBA74 \uC2EC\uB9E5\uC774 \uD130\uC9C4\uB2E4.",
        school: "darkArts",
        grade: "grandmaster",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "hwagong-daebeop", minSeong: 5 }],
        minDarkness: 2,
        traits: ["drain"]
        // 흡공 — 적 내공을 빨아 자신을 채운다(이종진기 → 심마). 광역 아님(단일 흡착).
      },
      {
        id: "cheonma-singong",
        name: "\uCC9C\uB9C8\uC2E0\uACF5",
        hanjaName: "\u5929\u9B54\u795E\u529F",
        description: "\uB9C8\uAD50 \uAD50\uC8FC\uC5D0\uAC8C\uB9CC \uC787\uB294 \uB9C8(\u9B54)\uC758 \uC815\uC810. \uCC9C\uD558\uC758 \uB9C8\uAE30\uB97C \uD55C \uBAB8\uC5D0 \uAC70\uB290\uB824 \uB9CC\uB9C8(\u842C\u9B54)\uB97C \uAD74\uBCF5\uC2DC\uD0A8\uB2E4 \u2014 \uC0AC\uB78C\uC774 \uCC9C\uB9C8\uAC00 \uB418\uC5B4\uC57C \uBE44\uB85C\uC18C \uC644\uC131\uB418\uB294 \uC2E0\uACF5(\u795E\u529F).",
        school: "darkArts",
        grade: "legendary",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "achievement",
        // 첫 천마(졸업) 업적으로 영구 해금. docs/32·21.
        prerequisites: [
          { artId: "cheonma-bijeon", minSeong: 8 },
          // 절품 마공 비전을 깊이 — 천마로 가는 길목
          { artId: "magyo-manma-simgong", minSeong: 6 }
          // 만마를 거느릴 심법 그릇
        ],
        minDarkness: 4,
        // 어둠에 완전히 삼켜진 자만 완성한다(천마 직업과 같은 게이트). docs/13·21.
        traits: ["drain", "sweep"]
        // 흡공(이종진기 → 심마) + 만마 광역 — 마의 정점.
      },
      // ─── 권(fist) 4 — 마라권 → 혈수장 → 광마권, 화골면장(소수마공 선행) ───
      {
        id: "magyo-mara-gwon",
        name: "\uB9C8\uB77C\uAD8C",
        hanjaName: "\u9B54\u7F85\u62F3",
        description: "\uD30C\uC21C(\uB9C8\uB77C)\uC758 \uC774\uB984\uC744 \uBE4C\uB9B0 \uB9C8\uAD50 \uC785\uBB38 \uAD8C\uBC95. \uC8FC\uBA39\uC5D0 \uB9C8\uAE30\uAC00 \uC2A4\uBBFC\uB2E4.",
        school: "fist",
        grade: "novice",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        minDarkness: 1
      },
      {
        id: "hwagol-myeonjang",
        name: "\uD654\uACE8\uBA74\uC7A5",
        hanjaName: "\u5316\u9AA8\u7DBF\u638C",
        description: "\uC2A4\uCE5C \uC790\uB9AC\uB294 \uBA40\uCA61\uD55C\uB370 \uBF08\uAC00 \uC19C\uCC98\uB7FC \uBB34\uB978\uB2E4\uB294 \uC74C\uB3C5\uD55C \uC7A5\uBC95.",
        school: "fist",
        grade: "apprentice",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        minDarkness: 1
      },
      {
        id: "magyo-hyeolsu-jang",
        name: "\uD608\uC218\uC7A5",
        hanjaName: "\u8840\u624B\u638C",
        description: "\uC190\uBC14\uB2E5\uC774 \uD54F\uBE5B\uC73C\uB85C \uBB3C\uB4DC\uB294 \uC7A5\uBC95. \uC2A4\uCE5C \uC0C1\uCC98\uAC00 \uC880\uCC98\uB7FC \uC544\uBB3C\uC9C0 \uC54A\uB294\uB2E4.",
        school: "fist",
        grade: "apprentice",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "magyo-mara-gwon", minSeong: 3 }],
        minDarkness: 1
      },
      {
        id: "magyo-gwangma-gwon",
        name: "\uAD11\uB9C8\uAD8C",
        hanjaName: "\u72C2\u9B54\u62F3",
        description: "\uAD11\uAE30\uC5D0 \uBAB8\uC744 \uB0B4\uB9E1\uAE38\uC218\uB85D \uAC15\uD574\uC9C0\uB294 \uB9C8\uAD50 \uC0C1\uC2B9 \uAD8C\uBC95.",
        school: "fist",
        grade: "master",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "magyo-hyeolsu-jang", minSeong: 5 }],
        minDarkness: 2
      },
      // ─── 보법(lightness) 4 — 초상비 → 마영보 → 혈무신법, 초상비 → 혈영신법 → 천마군림보 ───
      {
        id: "magyo-mayeong-bo",
        name: "\uB9C8\uC601\uBCF4",
        hanjaName: "\u9B54\u5F71\u6B65",
        description: "\uB9C8\uAE30 \uC5B4\uB9B0 \uADF8\uB9BC\uC790\uB97C \uD769\uBFCC\uB9AC\uBA70 \uC6C0\uC9C1\uC774\uB294 \uB9C8\uAD50 \uC785\uBB38 \uBCF4\uBC95.",
        school: "lightness",
        grade: "novice",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }],
        minDarkness: 1
      },
      {
        id: "hyeolyeong-sinbeop",
        name: "\uD608\uC601\uC2E0\uBC95",
        hanjaName: "\u8840\u5F71\u8EAB\u6CD5",
        description: "\uD54F\uBE5B \uC794\uC601\uB9CC \uB0A8\uAE30\uACE0 \uC2A4\uB7EC\uC9C0\uB294 \uB9C8\uAD50\uC758 \uC2E0\uBC95. \uCAD3\uB294 \uB208\uC774 \uC794\uC601\uC744 \uBCA0\uB294 \uC0AC\uC774 \uBCF8\uC2E0\uC740 \uC774\uBBF8 \uB4F1 \uB4A4\uB2E4.",
        school: "lightness",
        grade: "apprentice",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "chosangbi", minSeong: 4 }],
        minDarkness: 1
      },
      {
        id: "magyo-hyeolmu-sinbeop",
        name: "\uD608\uBB34\uC2E0\uBC95",
        hanjaName: "\u8840\u9727\u8EAB\u6CD5",
        description: "\uD54F\uBE5B \uC548\uAC1C \uC18D\uC73C\uB85C \uBAB8\uC744 \uAC10\uCD94\uB294 \uB9C8\uAD50\uC758 \uC2E0\uBC95.",
        school: "lightness",
        grade: "apprentice",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "magyo-mayeong-bo", minSeong: 3 }],
        minDarkness: 1
      },
      {
        id: "cheonma-gunrim-bo",
        name: "\uCC9C\uB9C8\uAD70\uB9BC\uBCF4",
        hanjaName: "\u5929\u9B54\u541B\u81E8\u6B65",
        description: "\uD55C \uAC78\uC74C\uB9C8\uB2E4 \uB9CC\uB9C8(\u842C\u9B54)\uAC00 \uC5CE\uB4DC\uB9B0\uB2E4. \uCC9C\uB9C8\uC758 \uC704\uC5C4\uC774 \uC2E4\uB9B0 \uB9C8\uAD50 \uC2E0\uBC95\uC758 \uC815\uC810.",
        school: "lightness",
        grade: "grandmaster",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "hyeolyeong-sinbeop", minSeong: 5 }],
        minDarkness: 3
      },
      // ─── 심법(qigong) 4 — 마기심법 → 마원공 → 만마심공, 수라마공 → 건곤대나이 ───
      {
        id: "magyo-magi-simbeop",
        name: "\uB9C8\uAE30\uC2EC\uBC95",
        hanjaName: "\u9B54\u6C23\u5FC3\u6CD5",
        description: "\uB9C8\uAE30\uB97C \uB2E8\uC804\uC5D0 \uBC1B\uC544\uB4E4\uC774\uB294 \uCCAB \uD638\uD761. \uBAA8\uB4E0 \uB9C8\uACF5\uC758 \uADF8\uB987\uC744 \uBE5A\uB294\uB2E4.",
        school: "qigong",
        grade: "novice",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        minDarkness: 1
      },
      {
        id: "magyo-mawon-gong",
        name: "\uB9C8\uC6D0\uACF5",
        hanjaName: "\u9B54\u5143\u529F",
        description: "\uB9C8\uAE30\uB97C \uC6D0\uAE30\uB85C \uAC08\uBB34\uB9AC\uD574 \uC313\uB294 \uB9C8\uAD50\uC758 \uC2EC\uBC95.",
        school: "qigong",
        grade: "apprentice",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "magyo-magi-simbeop", minSeong: 3 }],
        minDarkness: 1
      },
      {
        id: "magyo-manma-simgong",
        name: "\uB9CC\uB9C8\uC2EC\uACF5",
        hanjaName: "\u842C\u9B54\u5FC3\u529F",
        description: "\uB9CC \uAC00\uC9C0 \uB9C8\uAE30\uB97C \uD558\uB098\uB85C \uAC70\uB290\uB9B0\uB2E4\uB294 \uB9C8\uAD50 \uC0C1\uC2B9 \uC2EC\uBC95.",
        school: "qigong",
        grade: "master",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "magyo-mawon-gong", minSeong: 5 }],
        minDarkness: 2
      },
      {
        id: "geongon-daenai",
        name: "\uAC74\uACE4\uB300\uB098\uC774",
        hanjaName: "\u4E7E\u5764\u5927\u632A\u79FB",
        description: "\uD558\uB298\uACFC \uB545\uC758 \uD798\uC744 \uC62E\uACA8 \uC2E3\uB294\uB2E4 \u2014 \uC11C\uC5ED\uC5D0\uC11C \uC804\uB798\uD574 \uAD50\uC8FC\uC5D0\uAC8C\uB9CC \uC787\uB294 \uD638\uAD50\uC2E0\uACF5. \uC0C1\uB300\uC758 \uD798\uB9C8\uC800 \uB0B4 \uAC83\uC774 \uB41C\uB2E4.",
        school: "qigong",
        grade: "grandmaster",
        path: "jung",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "sura-magong", minSeong: 5 }],
        minDarkness: 2
      },
      // ─── 도(saber) 2 — 마기심법 → 마풍도 → 혈마도 ───
      {
        id: "magyo-mapung-do",
        name: "\uB9C8\uD48D\uB3C4",
        hanjaName: "\u9B54\u98A8\u5200",
        description: "\uB9C8\uD48D\uC774 \uD729\uC4F8\uB4EF \uAC70\uCE60\uAC8C \uBCA0\uC5B4 \uB118\uAE30\uB294 \uB9C8\uAD50\uC758 \uB3C4\uBC95.",
        school: "saber",
        grade: "apprentice",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "magyo-magi-simbeop", minSeong: 3 }],
        minDarkness: 1
      },
      {
        id: "magyo-hyeolma-do",
        name: "\uD608\uB9C8\uB3C4",
        hanjaName: "\u8840\u9B54\u5200",
        description: "\uCE7C\uB0A0\uC774 \uD53C\uB97C \uB9C8\uC2E4\uC218\uB85D \uBB34\uAC70\uC6CC\uC9C4\uB2E4\uB294 \uB9C8\uAD50 \uC0C1\uC2B9 \uB3C4\uBC95.",
        school: "saber",
        grade: "master",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "magyo-mapung-do", minSeong: 5 }],
        minDarkness: 2
      },
      // ─── 검(sword) 2 — 역혈공 → 입마검 → 역천검법 ───
      {
        id: "magyo-ipma-sword",
        name: "\uC785\uB9C8\uAC80",
        hanjaName: "\u5165\u9B54\u528D",
        description: "\uC785\uB9C8\uC758 \uBB38\uD131\uC5D0\uC11C \uC775\uD788\uB294 \uB9C8\uAD50\uC758 \uC785\uBB38 \uAC80. \uAC80\uC5D0 \uC5B4\uB460\uC774 \uAE43\uB4E4\uAE30 \uC2DC\uC791\uD55C\uB2E4.",
        school: "sword",
        grade: "novice",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "magyo-yeokhyeol-gong", minSeong: 3 }],
        minDarkness: 1
      },
      {
        id: "magyo-yeokcheon-geombeop",
        name: "\uC5ED\uCC9C\uAC80\uBC95",
        hanjaName: "\u9006\u5929\u528D\u6CD5",
        description: "\uD558\uB298\uC758 \uACB0\uC744 \uAC70\uC2AC\uB7EC \uBCA0\uB294 \uB9C8\uAD50\uC758 \uAC80.",
        school: "sword",
        grade: "apprentice",
        path: "ma",
        isSectArt: false,
        lineage: "magyo",
        acquisition: "quest",
        prerequisites: [{ artId: "magyo-ipma-sword", minSeong: 3 }],
        minDarkness: 1
      }
    ];
  }
});

// src/data/martialArts/catalog/legend.ts
var LEGEND_ARTS;
var init_legend = __esm({
  "src/data/martialArts/catalog/legend.ts"() {
    "use strict";
    LEGEND_ARTS = [
      {
        id: "dokgo-gugeom",
        name: "\uB3C5\uACE0\uAD6C\uAC80",
        hanjaName: "\u7368\u5B64\u4E5D\u528D",
        description: "\uC544\uD649 \uC2DD\uC73C\uB85C \uCC9C\uD558 \uB9CC\uCD08\uB97C \uAE68\uB728\uB9B0\uB2E4\uB294 \uC804\uC124\uC758 \uAC80. \uCD08\uC2DD\uC774 \uC5C6\uC5B4 \uAE68\uB2EC\uC740 \uC790\uB9CC \uC787\uB294\uB2E4.",
        school: "sword",
        grade: "legendary",
        path: "jung",
        isSectArt: false,
        lineage: "legend",
        acquisition: "achievement",
        traits: ["pierce", "swift"]
        // 파초(破招) — 만초를 깨뜨리는 단일 검의 정점(광역 아님, 일대일 최강).
      },
      {
        id: "neungpa-mibo",
        name: "\uB2A5\uD30C\uBBF8\uBCF4",
        hanjaName: "\u51CC\u6CE2\u5FAE\u6B65",
        description: "\uBB3C\uACB0 \uC704\uB97C \uC2A4\uCE58\uB4EF \uAC77\uB294\uB2E4\uB294 \uC804\uC124\uC758 \uBCF4\uBC95. \uC721\uC2ED\uC0AC\uAD18\uC758 \uC790\uB9AC\uB97C \uBC1F\uB294\uB2E4.",
        school: "lightness",
        grade: "grandmaster",
        path: "jung",
        isSectArt: false,
        lineage: "legend",
        acquisition: "quest",
        // 경공 사다리 정점(등평도수)을 딛고서야 — 초상비 직행 지름길이 첫 회차 화경을 뚫던 구멍 봉합(2026-06-11).
        prerequisites: [{ artId: "deungpyeong-dosu", minSeong: 5 }]
      },
      {
        id: "legend-heogong-dapbo",
        name: "\uD5C8\uACF5\uB2F5\uBCF4",
        hanjaName: "\u865B\u7A7A\u8E0F\u6B65",
        description: "\uD5C8\uACF5\uC744 \uACC4\uB2E8 \uC0BC\uC544 \uBC1F\uB294\uB2E4 \u2014 \uACBD\uACF5\uC774 \uB2FF\uC744 \uC218 \uC788\uB294 \uB9C8\uC9C0\uB9C9 \uACBD\uC9C0\uB77C \uC804\uD55C\uB2E4.",
        school: "lightness",
        grade: "grandmaster",
        path: "jung",
        isSectArt: false,
        lineage: "legend",
        acquisition: "quest",
        prerequisites: [{ artId: "deungpyeong-dosu", minSeong: 6 }]
      },
      {
        id: "legend-tanji-sintong",
        name: "\uD0C4\uC9C0\uC2E0\uD1B5",
        hanjaName: "\u5F48\u6307\u795E\u901A",
        description: "\uC190\uAC00\uB77D \uD55C \uBC88 \uD295\uAE40\uC5D0 \uBC14\uC704\uAC00 \uB6AB\uB9B0\uB2E4. \uCC9C\uD558\uC81C\uC77C\uC758 \uC9C0\uB825(\u6307\u529B)\uC774\uB77C \uBD88\uB9AC\uB294 \uAE30\uC5F0\uC758 \uC808\uD559.",
        school: "hidden",
        grade: "grandmaster",
        path: "jung",
        isSectArt: false,
        lineage: "legend",
        acquisition: "quest",
        traits: ["pierce"]
        // 지력으로 바위를 뚫는다 — 호신강기 관통(파공).
      },
      {
        id: "legend-ilyang-ji",
        name: "\uC77C\uC591\uC9C0",
        hanjaName: "\u4E00\u967D\u6307",
        description: "\uD55C \uAC00\uB2E5 \uC591\uAC15\uC758 \uAE30\uB97C \uC190\uB05D\uC5D0 \uBAA8\uC544 \uD608\uB3C4\uB97C \uC81C\uC555\uD558\uACE0 \uC74C\uB3C5\uC744 \uBAB0\uC544\uB0B4\uB294 \uC804\uC124\uC758 \uC9C0\uBC95.",
        school: "medical",
        grade: "grandmaster",
        path: "jeong",
        isSectArt: false,
        lineage: "legend",
        acquisition: "quest",
        traits: ["pierce"]
        // 손끝 양강기로 혈도를 짚는다 — 원거리 지력 파공(점혈).
      },
      {
        id: "legend-saja-hu",
        name: "\uC0AC\uC790\uD6C4",
        hanjaName: "\u7345\u5B50\u543C",
        description: "\uC0AC\uC790\uC758 \uC6B8\uC74C\uC774 \uBC31\uC218\uB97C \uC5CE\uB4DC\uB9AC\uAC8C \uD558\uB4EF, \uD55C \uC18C\uB9AC\uB85C \uC2EC\uB9E5\uC744 \uB4A4\uD754\uB4DC\uB294 \uBD88\uAC00\uC758 \uC74C\uACF5.",
        school: "qigong",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "legend",
        acquisition: "quest",
        prerequisites: [{ artId: "tonap-beop", minSeong: 5 }]
      },
      {
        id: "legend-byeokgong-jang",
        name: "\uBCBD\uACF5\uC7A5",
        hanjaName: "\u5288\u7A7A\u638C",
        description: "\uD5C8\uACF5\uC744 \uAC08\uB77C \uC2ED \uBCF4 \uBC16\uC744 \uCE5C\uB2E4\uB294 \uACA9\uACF5\uC7A5\uC758 \uB300\uBA85\uC0AC.",
        school: "fist",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "legend",
        acquisition: "quest",
        prerequisites: [{ artId: "taejo-janggwon", minSeong: 5 }]
      },
      {
        id: "legend-eungjo-gong",
        name: "\uC751\uC870\uACF5",
        hanjaName: "\u9DF9\u722A\u529F",
        description: "\uB9E4\uC758 \uBC1C\uD1B1\uCC98\uB7FC \uC1E0\uB97C \uC6C0\uCF1C \uBD80\uC218\uB294 \uC804\uD1B5\uC758 \uC870\uBC95(\u722A\u6CD5).",
        school: "fist",
        grade: "master",
        path: "jung",
        isSectArt: false,
        lineage: "legend",
        acquisition: "quest",
        prerequisites: [{ artId: "taejo-janggwon", minSeong: 4 }]
      },
      {
        id: "legend-cheongeun-chu",
        name: "\uB3C4\uAC80\uBD88\uCE68",
        hanjaName: "\u5200\u528D\u4E0D\u4FB5",
        description: "\uCE7C\uACFC \uAC80\uC774 \uC0B4\uAC17\uC744 \uBCA0\uC9C0 \uBABB\uD55C\uB2E4 \u2014 \uBAB8\uC774 \uBCD1\uAE30\uB97C \uAC70\uBD80\uD558\uB294 \uC678\uACF5\uC758 \uACBD\uC9C0.",
        school: "external",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "legend",
        acquisition: "quest",
        prerequisites: [{ artId: "geumjong-jo", minSeong: 4 }]
      },
      {
        id: "legend-cheoldu-gong",
        name: "\uCCA0\uC6B0\uACF5",
        hanjaName: "\u9435\u725B\u529F",
        description: "\uBB34\uC1E0 \uC18C\uCC98\uB7FC \uC6B0\uC9C1\uD558\uAC8C \uBC84\uD2F0\uB294 \uC804\uD1B5 \uC678\uACF5. \uBC00\uB9AC\uC9C0\uB3C4 \uB6AB\uB9AC\uC9C0\uB3C4 \uC54A\uB294\uB2E4.",
        school: "external",
        grade: "apprentice",
        path: "jung",
        isSectArt: false,
        lineage: "legend",
        acquisition: "quest",
        prerequisites: [{ artId: "geumjong-jo", minSeong: 3 }]
      }
    ];
  }
});

// src/data/martialArts/catalog.ts
var MARTIAL_ARTS;
var init_catalog = __esm({
  "src/data/martialArts/catalog.ts"() {
    "use strict";
    init_common();
    init_hwasan();
    init_mudang();
    init_sorim();
    init_gaebang();
    init_ami();
    init_jeomchang();
    init_gollyun();
    init_jongnam();
    init_cheongseong();
    init_gongdong();
    init_namgung();
    init_dangga();
    init_paengga();
    init_moyong();
    init_pyoguk();
    init_doga();
    init_uiga();
    init_salsu();
    init_sapa();
    init_magyo();
    init_legend();
    MARTIAL_ARTS = [
      ...COMMON_ARTS,
      ...HWASAN_ARTS,
      ...MUDANG_ARTS,
      ...SORIM_ARTS,
      ...GAEBANG_ARTS,
      ...AMI_ARTS,
      ...JEOMCHANG_ARTS,
      ...GOLLYUN_ARTS,
      ...JONGNAM_ARTS,
      ...CHEONGSEONG_ARTS,
      ...GONGDONG_ARTS,
      ...NAMGUNG_ARTS,
      ...DANGGA_ARTS,
      ...PAENGGA_ARTS,
      ...MOYONG_ARTS,
      ...PYOGUK_ARTS,
      ...DOGA_ARTS,
      ...UIGA_ARTS,
      ...SALSU_ARTS,
      ...SAPA_ARTS,
      ...MAGYO_ARTS,
      ...LEGEND_ARTS
    ];
  }
});

// src/data/martialArts/traitOverrides.ts
var ART_TRAIT_OVERRIDE;
var init_traitOverrides = __esm({
  "src/data/martialArts/traitOverrides.ts"() {
    "use strict";
    ART_TRAIT_OVERRIDE = {
      // ═══ 사천당가(dangga) — 독의 본산. 암기·장법·심법이 거의 다 독. 기본값(권·암기 jung=무독) 보정 ═══
      // 암기(독침·독표) — 폭우/화우 결만 광역, 나머지는 단일 독.
      "bipyo-sul": ["poison"],
      "dangga-bichim-sul": ["poison"],
      "dangga-chuhon-pyo": ["poison"],
      "cheonnyeo-sanhwa": ["sweep", "poison"],
      // 천녀산화 — 흩뿌리는 독침(광역)
      "dangga-yeonhwan-pyo": ["poison"],
      "dangga-dokjillyeo-sul": ["poison"],
      "dangga-chwiu-chim": ["poison"],
      "dangga-nakhwa-pyo": ["poison"],
      "dangga-bihwangseok": ["poison"],
      // mancheon-hwawu(만천화우)는 카탈로그 inline(sweep·poison) — 유지
      "dangga-dokryong-pyo": ["poison"],
      "dangga-bihwa-sinchim": ["poison"],
      "pokwu-ihwa-chim": ["sweep", "poison"],
      // 폭우이화침 — 폭우처럼 쏟아지는 독침(광역)
      "dangga-cheondok-hwawu": ["sweep", "poison"],
      // 천독화우 — 꽃비 독(광역)
      "dangga-muhyeong-chim": ["poison", "pierce"],
      // 무형침 — 보이지 않는 독침(단일·관통)
      // 독장(권) — 전부 독, 단일(만독수는 정점이나 광역 아닌 독장 → sweep 제거)
      "dangga-cheongdok-su": ["poison"],
      "doksa-jang": ["poison"],
      "dangga-chwidok-jang": ["poison"],
      "dangga-odok-jang": ["poison"],
      "dangga-bugol-jang": ["poison"],
      "dangga-mandok-su": ["poison"],
      // 만독수 — 절품 독장이나 광역 아님(독·단일)
      // 어독심결·호심기공·백독불침공·천독신공(내공)·암영보·무성보(보법)·용독술·해독비결(의가) = 기본값 정확(생략)
      // ═══ 살수(salsu) — 암살 = 정밀 단일·은밀. 독은 약·침만, 검은 그림자 쾌검, 절품검도 광역 아님 ═══
      "salsu-monghan-yakbeop": ["poison"],
      // 몽한약법 — 잠드는 약
      "salsu-yau-bichim": ["poison"],
      //      야우비침 — 맞은 줄 모르는 독침
      "salsu-janyeong-sword": ["swift"],
      //   잔영검 — 쾌검
      "muyeong-geom": ["swift"],
      //           무영검 — 보였을 때 늦은 쾌검
      "salsu-danhon-sword": ["swift"],
      //     단혼검 — 한 호흡의 쾌검
      "salsu-muheun-sword": ["pierce", "swift"],
      // 무흔검 — 절품 살수검(광역 아닌 정밀 단일·관통)
      "jeolmyeong-13-chim": ["pierce"],
      //    절명십삼침 — 절명혈 점혈(관통)
      // 비수·수전·표창·검(야행/무성)·보법(전부 swift 기본값)·도·심법 = 기본값 정확(생략)
      // ═══ 절품 검 중 "정밀 단일" — 검강 광역이 아니라 일격·섬광·찌르기. 기본값(절품 검=광역) 보정 ═══
      "hwasan-seoak-ilgeom": ["pierce"],
      //          서악일검 — 천 초식이 한 획으로(단 한 번의 관통 일격)
      "jeomchang-gwanil-sword": ["pierce", "swift"],
      // 관일검 — 해를 꿰뚫는 점창 쾌검
      "sail-sword": ["pierce", "swift"],
      //          사일검법 — 천하에서 가장 빠른 찌르기(관통·쾌)
      "namgung-cheonroe-ilseom-sword": ["pierce", "swift"],
      // 천뢰일섬검 — 한 섬광으로 모이는 뇌전
      "moyong-hoecheon-seomyeong-sword": ["swift"],
      // 회천섬영검 — 빠름과 되돌림(섬영·쾌)
      "doga-muwi-sword": ["pierce"],
      //              무위검 — 막을 길 없다(관통, 광역 아닌 흐름)
      // 매화검·적하장천·만리청풍·만불조종·운룡승천·곤오신검·복마신검·현천무극·태극검·무극검·
      // 천하무극·삼락검·제왕검형·대천강검·혈하검법 = 검강·만방 광역(기본값 sweep 정확, 유지)
      // ═══ 쾌검 명가(점창·종남·모용) — 빠름이 곧 검. 단일·쾌속(상승은 관통 겸함) ═══
      "jeomchang-yuseong-sword": ["swift"],
      //  유성검 — 한 번 떨어지는 쾌검
      "jeomchang-ilseom-sword": ["pierce", "swift"],
      // 일섬검 — 보면 이미 꿰뚫린 쾌검
      "jongnam-yuseong-sword": ["swift"],
      //    낙성검 — 별똥 쾌검
      "jongnam-cheonseong-sword": ["swift"],
      // 천성검 — 연달아 떨어지는 쾌검
      "moyong-chupung-sword": ["swift"],
      //     추풍검 — 바람 뒤쫓는 기초 쾌검
      "cheongseong-jukyeop-sword": ["swift"],
      // 죽엽검 — 잘고 빠른 검
      // ═══ 속성·광폭 — 무공 속성이 상처를 남긴다(화염→화상·빙한→동상). 광폭은 아군 오사 ═══
      // 곤륜(빙·설) — 빙공 검·권이 동상을 입힌다.
      "gollyun-bingha-sword": ["frost"],
      //   빙하검 — 만년 빙하의 검
      "gollyun-seolsan-geombeop": ["frost"],
      // 설산검법 — 설산의 한기
      "gollyun-seolsan-gwon": ["frost"],
      //   설산권 — 빙한 권
      // 마교 혈마공 — 피로 기를 기르는 막무가내 마공(광역+아군오사+흡공).
      "hyeolma-gong": ["sweep", "wild", "drain"]
    };
  }
});

// src/data/martialArts/index.ts
function findMartialArt(id) {
  return MARTIAL_ARTS.find((m) => m.id === id);
}
function defaultArtTraits(art) {
  const t = [];
  const highGrade = art.grade === "grandmaster" || art.grade === "legendary";
  const striker = art.school === "sword" || art.school === "saber" || art.school === "fist" || art.school === "darkArts";
  if (highGrade && striker) t.push("sweep");
  if (art.school === "external" || art.school === "qigong") t.push("guard");
  if (art.school === "lightness") t.push("swift");
  return t;
}
function artTraits(art) {
  return ART_TRAIT_OVERRIDE[art.id] ?? art.traits ?? defaultArtTraits(art);
}
function woundResistOf(insts) {
  const has = (id) => insts.some((i) => i.artId === id);
  const r = {};
  for (const { artId, type } of FULL_RESIST_ARTS) {
    if (has(artId)) r[type] = 2;
  }
  if ((r.poison ?? 0) < 2) {
    let bestPoisonSeong = 0;
    for (const inst of insts) {
      const art = findMartialArt(inst.artId);
      if (art && artTraits(art).includes("poison")) bestPoisonSeong = Math.max(bestPoisonSeong, inst.seong);
    }
    if (has("dangga-baekdok-bulchim-gong") || bestPoisonSeong >= 4) r.poison = 1;
  }
  return r;
}
function resistsWound(level, severity) {
  if (!level) return false;
  if (level >= 2) return true;
  return severity >= 2;
}
function initialSeong(disciple, art) {
  const floor = REALM_LEARN_FLOOR[disciple.realm];
  const cap = Math.min(seongCap(art.grade), REALM_SEONG_CAP[disciple.realm]);
  return Math.max(1, Math.min(floor, cap));
}
function seongCap(grade) {
  switch (grade) {
    case "novice":
      return 6;
    case "apprentice":
      return 7;
    case "master":
      return 9;
    case "grandmaster":
    case "legendary":
      return 10;
  }
}
function expToNextSeong(seong) {
  const s = Math.max(1, seong);
  return 140 + (s - 1) * 80;
}
var FULL_RESIST_ARTS, GRADE_LEARN_MULT;
var init_martialArts = __esm({
  "src/data/martialArts/index.ts"() {
    "use strict";
    init_realm2();
    init_catalog();
    init_traitOverrides();
    FULL_RESIST_ARTS = [
      { artId: "dangga-cheondok-singong", type: "poison" },
      //  천독신공 → 만독불침
      { artId: "geumgang-bulgoe", type: "wound" },
      //           금강불괴 → 금강불괴(외상)
      { artId: "sunyang-mugeuk-gong", type: "frost" },
      //       순양무극공 → 한서불침(동상)
      { artId: "paengga-yanggang-singong", type: "frost" },
      //  양강신공 → 한서불침(동상)
      { artId: "jeomchang-yeolyang-singong", type: "burn" }
      // 열양신공 → 화염불침(화상)
    ];
    GRADE_LEARN_MULT = {
      novice: 2.2,
      apprentice: 1.6,
      master: 1,
      grandmaster: 1,
      legendary: 1
    };
  }
});

// src/stores/codexStore.ts
var codexStore_exports = {};
__export(codexStore_exports, {
  useCodexStore: () => useCodexStore
});
var useCodexStore;
var init_codexStore = __esm({
  "src/stores/codexStore.ts"() {
    "use strict";
    init_esm();
    init_middleware();
    init_martialArts();
    init_persistStorage();
    useCodexStore = create()(
      persist(
        (set, get) => ({
          scrolls: [],
          elixirs: [],
          addScroll: (item) => set((s) => {
            if (s.scrolls.some((x) => x.artId === item.artId)) return s;
            return { scrolls: [...s.scrolls, item] };
          }),
          updateResearchProgress: (artId, delta) => set((s) => ({
            scrolls: s.scrolls.map((x) => {
              if (x.artId !== artId) return x;
              const next = Math.max(0, Math.min(100, x.researchProgress + delta));
              const status = next >= 100 ? "complete" : next > 0 ? "researching" : x.status;
              return { ...x, researchProgress: next, status };
            })
          })),
          setScrollStatus: (artId, status) => set((s) => ({
            scrolls: s.scrolls.map(
              (x) => x.artId === artId ? { ...x, status } : x
            )
          })),
          patchScroll: (artId, patch) => set((s) => ({
            scrolls: s.scrolls.map(
              (x) => x.artId === artId ? { ...x, ...patch } : x
            )
          })),
          removeScroll: (artId) => set((s) => ({ scrolls: s.scrolls.filter((x) => x.artId !== artId) })),
          hasScroll: (artId) => get().scrolls.some((x) => x.artId === artId),
          addElixir: (elixirId, quantity, atDay) => set((s) => {
            const existing = s.elixirs.find((e) => e.elixirId === elixirId);
            if (existing) {
              return {
                elixirs: s.elixirs.map(
                  (e) => e.elixirId === elixirId ? { ...e, quantity: e.quantity + quantity } : e
                )
              };
            }
            return {
              elixirs: [
                ...s.elixirs,
                { elixirId, quantity, acquiredAtDay: atDay }
              ]
            };
          }),
          consumeElixir: (elixirId, quantity) => set((s) => ({
            elixirs: s.elixirs.map(
              (e) => e.elixirId === elixirId ? { ...e, quantity: Math.max(0, e.quantity - quantity) } : e
            ).filter((e) => e.quantity > 0)
          })),
          // 새 회차: 비급 원본은 유지, 연구 진행도/status 0, 영약 전부 소실.
          // 단 시작 소장 5권(acquisition 'start' — 본문 비급)은 이미 풀이된 것 — 연구 완료 유지.
          resetForNewRun: () => set((s) => {
            const startIds = new Set(
              MARTIAL_ARTS.filter((a) => a.acquisition === "start").map((a) => a.id)
            );
            return {
              scrolls: s.scrolls.map(
                (x) => startIds.has(x.artId) ? { ...x, researchProgress: 100, status: "complete", researchStartAt: void 0, researchEndAt: void 0 } : { ...x, researchProgress: 0, status: "identified", researchStartAt: void 0, researchEndAt: void 0 }
              ),
              elixirs: []
            };
          }),
          resetAll: () => set({ scrolls: [], elixirs: [] })
        }),
        {
          name: "codex",
          storage: createJSONStorage(() => slotAwareStorage),
          partialize: (s) => ({ scrolls: s.scrolls, elixirs: s.elixirs })
        }
      )
    );
  }
});

// scripts/sim/_storageShim.ts
var mem = /* @__PURE__ */ new Map();
var ls = {
  getItem: (k) => mem.has(k) ? mem.get(k) : null,
  setItem: (k, v) => {
    mem.set(k, String(v));
  },
  removeItem: (k) => {
    mem.delete(k);
  },
  clear: () => mem.clear(),
  key: (i) => Array.from(mem.keys())[i] ?? null,
  get length() {
    return mem.size;
  }
};
var g = globalThis;
if (!g.window) g.window = { localStorage: ls };
if (!g.localStorage) g.localStorage = ls;

// src/stores/questStore.ts
init_esm();
init_middleware();
init_persistStorage();
var useQuestStore = create()(
  persist(
    (set) => ({
      board: [],
      active: [],
      setBoard: (board) => set({ board }),
      addToBoard: (q) => set((s) => s.board.some((x) => x.id === q.id) ? s : { board: [q, ...s.board] }),
      removeFromBoard: (questId) => set((s) => ({ board: s.board.filter((q) => q.id !== questId) })),
      addActive: (a) => set((s) => ({ active: [...s.active, a] })),
      updateActive: (questId, patch) => set((s) => ({
        active: s.active.map((a) => a.quest.id === questId ? { ...a, ...patch } : a)
      })),
      removeActive: (questId) => set((s) => ({ active: s.active.filter((x) => x.quest.id !== questId) })),
      reset: () => set({ board: [], active: [] })
    }),
    {
      name: "quest",
      storage: createJSONStorage(() => slotAwareStorage),
      version: 1,
      partialize: (s) => ({ board: s.board, active: s.active })
    }
  )
);

// src/stores/sectStore.ts
init_esm();
init_middleware();
init_persistStorage();
var useSectStore = create()(
  persist(
    (set) => ({
      sect: null,
      setSect: (sect) => set({ sect }),
      update: (patch) => set((s) => s.sect ? { sect: { ...s.sect, ...patch } } : s),
      upgradeFacility: (facilityId) => set((s) => {
        if (!s.sect) return s;
        const facilities = s.sect.facilities.map(
          (f) => f.id === facilityId ? { ...f, level: f.level + 1 } : f
        );
        return { sect: { ...s.sect, facilities } };
      }),
      adjustReputation: (delta) => set((s) => {
        if (!s.sect) return s;
        return {
          sect: {
            ...s.sect,
            reputation: Math.max(0, Math.min(100, s.sect.reputation + delta))
          }
        };
      }),
      adjustResources: (delta) => set((s) => {
        if (!s.sect) return s;
        return {
          sect: { ...s.sect, resources: Math.max(0, s.sect.resources + delta) }
        };
      }),
      reset: () => set({ sect: null })
    }),
    {
      name: "sect",
      storage: createJSONStorage(() => slotAwareStorage)
    }
  )
);

// src/stores/discipleStore.ts
init_esm();
init_middleware();

// src/data/training/index.ts
var BASE_MAX_STAMINA = 50;
function deriveMaxStamina(enduranceLevel) {
  return Math.max(10, Math.round(enduranceLevel) * 10);
}
function expToNext(level) {
  const lv = Math.max(0, level);
  return 20 + lv * 4 + Math.floor(lv / 10) * 40;
}
function statCap(statId) {
  if (statId === "endurance") return 18;
  return 100;
}

// src/stores/discipleStore.ts
init_martialArts();
init_constants();
init_persistStorage();
var DEFAULT_PERSONALITY = {
  integrity: PERSONALITY.DEFAULT,
  freedom: PERSONALITY.DEFAULT,
  warmth: PERSONALITY.DEFAULT,
  prudence: PERSONALITY.DEFAULT,
  mercy: PERSONALITY.DEFAULT,
  ambition: PERSONALITY.DEFAULT
};
function migratePersonality(p) {
  if (typeof p.integrity === "number") {
    return {
      integrity: p.integrity,
      freedom: p.freedom ?? 50,
      warmth: p.warmth ?? 50,
      prudence: p.prudence ?? 50,
      mercy: p.mercy ?? 50,
      ambition: p.ambition ?? 50
    };
  }
  const sc = (v) => v == null ? 50 : v <= 5 ? Math.max(1, Math.min(100, Math.round(v * 20 - 10))) : v;
  const dil = sc(p.diligence);
  const pri = sc(p.pride);
  const loy = sc(p.loyalty);
  const cur = sc(p.curiosity);
  const emp = sc(p.empathy);
  return {
    integrity: Math.round((dil + loy) / 2),
    // 성실+의리 → 강직
    freedom: cur,
    // 호기 → 자유
    warmth: emp,
    // 공감 → 다정
    prudence: 50,
    mercy: emp,
    // 공감 → 자비
    ambition: pri
    // 자존 → 야망
  };
}
function normalizePersonality(p) {
  if (!p) return DEFAULT_PERSONALITY;
  return migratePersonality(p);
}
var OLD_STAGE_TO_SEONG = {
  introduction: 1,
  small_completion: 4,
  great_completion: 7,
  transcendent: 9,
  peerless: 10
};
function normalizeMartialInstance(inst) {
  if (typeof inst?.seong === "number") return inst;
  const legacy = inst;
  const seong = OLD_STAGE_TO_SEONG[legacy.stage ?? ""] ?? 1;
  const need = expToNextSeong(seong);
  const prog = typeof legacy.progress === "number" ? legacy.progress : 0;
  const exp = Math.max(0, Math.min(need - 1, Math.round(prog / 100 * need)));
  return { artId: legacy.artId, seong, exp, unlockedAt: legacy.unlockedAt ?? 0 };
}
function withDefaults(d) {
  const { wound: legacyWound, ...rest } = d;
  const wounds = rest.wounds?.length ? rest.wounds : legacyWound ? [legacyWound] : rest.wounds;
  return {
    ...rest,
    wounds,
    personality: normalizePersonality(d.personality),
    martialArts: (d.martialArts ?? []).map(normalizeMartialInstance),
    maxStamina: d.maxStamina ?? BASE_MAX_STAMINA,
    // stamina 미지정 방어 — 미지정이면 만전(maxStamina)으로. 안 하면 staminaFrac=stamina/maxStamina 가
    // NaN 이 되어 전투 시트(staminaMult)·체력 로직에 NaN 이 새고, 강한 제자가 약한 제자에게 무승부로
    // 묶이는 등 전투가 망가진다. maxStamina 를 디폴트하면서 stamina 만 빠뜨리던 구멍 봉합. 2026-06-19. 🔧
    stamina: d.stamina ?? (d.maxStamina ?? BASE_MAX_STAMINA),
    stress: d.stress ?? 0,
    stats: d.stats ?? {},
    efficiency: d.efficiency ?? {},
    insight: d.insight ?? d.talents?.insight ?? 3,
    fame: d.fame ?? 0,
    // 경지 — 구버전 세이브 보정. 무공 입문 상태면 삼류, 미입문이면 none.
    realm: d.realm ?? (d.martialArts && d.martialArts.length > 0 ? "samryu" : "none"),
    realmProgress: {
      internal: d.realmProgress?.internal ?? 0,
      pity: d.realmProgress?.pity ?? 0,
      petitioned: d.realmProgress?.petitioned ?? false
    }
  };
}
var useDiscipleStore = create()(
  persist(
    (set, get) => ({
      disciples: {},
      order: [],
      setAll: (list) => set({
        disciples: Object.fromEntries(list.map((d) => [d.id, withDefaults(d)])),
        order: list.map((d) => d.id)
      }),
      add: (disciple) => set((s) => ({
        disciples: { ...s.disciples, [disciple.id]: withDefaults(disciple) },
        order: s.order.includes(disciple.id) ? s.order : [...s.order, disciple.id]
      })),
      remove: (id) => set((s) => {
        const { [id]: _, ...rest } = s.disciples;
        return { disciples: rest, order: s.order.filter((x) => x !== id) };
      }),
      update: (id, patch) => set((s) => {
        const current = s.disciples[id];
        if (!current) return s;
        return { disciples: { ...s.disciples, [id]: { ...current, ...patch } } };
      }),
      setActivity: (id, activity) => set((s) => {
        const current = s.disciples[id];
        if (!current) return s;
        return {
          disciples: {
            ...s.disciples,
            [id]: { ...current, currentActivity: activity }
          }
        };
      }),
      adjustTrust: (id, delta) => set((s) => {
        const current = s.disciples[id];
        if (!current) return s;
        const next = Math.max(0, Math.min(100, current.trustToMaster + delta));
        return {
          disciples: { ...s.disciples, [id]: { ...current, trustToMaster: next } }
        };
      }),
      adjustStamina: (id, delta) => set((s) => {
        const current = s.disciples[id];
        if (!current) return s;
        const max = current.maxStamina ?? BASE_MAX_STAMINA;
        const next = Math.max(0, Math.min(max, current.stamina + delta));
        return {
          disciples: { ...s.disciples, [id]: { ...current, stamina: next } }
        };
      }),
      adjustStress: (id, delta) => set((s) => {
        const current = s.disciples[id];
        if (!current) return s;
        const next = Math.max(0, Math.min(100, (current.stress ?? 0) + delta));
        return {
          disciples: { ...s.disciples, [id]: { ...current, stress: next } }
        };
      }),
      setFatiguePenalty: (id, penalty) => set((s) => {
        const current = s.disciples[id];
        if (!current) return s;
        return {
          disciples: {
            ...s.disciples,
            [id]: { ...current, fatiguePenalty: Math.max(0, Math.min(1, penalty)) }
          }
        };
      }),
      addStatExp: (id, statId, expDelta) => {
        if (expDelta <= 0) return 0;
        let levelUps = 0;
        set((s) => {
          const current = s.disciples[id];
          if (!current) return s;
          const stats = { ...current.stats ?? {} };
          const track = stats[statId] ?? { level: 0, exp: 0 };
          const cap = statCap(statId);
          let { level, exp } = track;
          exp += expDelta;
          while (level < cap && exp >= expToNext(level)) {
            exp -= expToNext(level);
            level += 1;
            levelUps += 1;
          }
          if (level >= cap) {
            level = cap;
            exp = 0;
          }
          stats[statId] = { level, exp };
          const patch = { stats };
          if (statId === "endurance" && levelUps > 0) {
            patch.maxStamina = deriveMaxStamina(level);
          }
          return { disciples: { ...s.disciples, [id]: { ...current, ...patch } } };
        });
        return levelUps;
      },
      setRelation: (id, otherId, level) => set((s) => {
        if (id === otherId) return s;
        const current = s.disciples[id];
        if (!current) return s;
        return {
          disciples: {
            ...s.disciples,
            [id]: {
              ...current,
              relationships: { ...current.relationships, [otherId]: level }
            }
          }
        };
      }),
      assignMainMartialArt: (id, artId) => set((s) => {
        const cur = s.disciples[id];
        if (!cur) return s;
        if (cur.status === "graduated" || cur.status === "departed") return s;
        const has = cur.martialArts.some((a) => a.artId === artId);
        let martialArts = cur.martialArts;
        if (!has) {
          const { useCodexStore: useCodexStore2 } = (init_codexStore(), __toCommonJS(codexStore_exports));
          const scroll = useCodexStore2.getState().scrolls.find((x) => x.artId === artId);
          if (!scroll || scroll.status !== "complete") return s;
          const art = findMartialArt(artId);
          const seong = art ? initialSeong(cur, art) : 1;
          martialArts = [...cur.martialArts, { artId, seong, exp: 0, unlockedAt: 0 }];
        }
        return {
          disciples: {
            ...s.disciples,
            [id]: { ...cur, martialArts, mainMartialArtId: artId }
          }
        };
      }),
      get: (id) => get().disciples[id],
      reset: () => set({ disciples: {}, order: [] })
    }),
    {
      name: "disciple",
      storage: createJSONStorage(() => slotAwareStorage),
      version: 5,
      // v4→v5: 단일 상처(wound)→속성별 배열(wounds) (withDefaults 가 마이그레이션)
      partialize: (s) => ({ disciples: s.disciples, order: s.order }),
      migrate: (persisted) => {
        const p = persisted ?? {};
        const disciples = p.disciples ?? {};
        const patched = {};
        for (const [id, d] of Object.entries(disciples)) {
          patched[id] = withDefaults(d);
        }
        return { disciples: patched, order: p.order ?? [] };
      }
    }
  )
);

// src/stores/timeStore.ts
init_esm();
init_middleware();
init_constants();
init_persistStorage();
var SEASON_ORDER = ["spring", "summer", "autumn", "winter"];
var PHASE_ORDER = ["morning", "afternoon", "evening"];
var INITIAL_TIME = {
  year: 1,
  season: "spring",
  week: 1,
  day: 1,
  phase: "morning"
};
function nextPhase(time) {
  const idx = PHASE_ORDER.indexOf(time.phase);
  if (idx < PHASE_ORDER.length - 1) {
    return { ...time, phase: PHASE_ORDER[idx + 1] };
  }
  return advanceDayPure({ ...time, phase: "morning" });
}
function advanceDayPure(time) {
  let { year, season, week, day } = time;
  day += 1;
  if (day > GAME.DAYS_PER_WEEK) {
    day = 1;
    week += 1;
    if (week > GAME.WEEKS_PER_SEASON) {
      week = 1;
      const sIdx = SEASON_ORDER.indexOf(season);
      if (sIdx < SEASON_ORDER.length - 1) {
        season = SEASON_ORDER[sIdx + 1];
      } else {
        season = "spring";
        year += 1;
      }
    }
  }
  return { year, season, week, day, phase: "morning" };
}
function computeTotalDay(t) {
  const seasonIdx = SEASON_ORDER.indexOf(t.season);
  const daysPerSeason = GAME.WEEKS_PER_SEASON * GAME.DAYS_PER_WEEK;
  return (t.year - 1) * GAME.SEASONS_PER_YEAR * daysPerSeason + seasonIdx * daysPerSeason + (t.week - 1) * GAME.DAYS_PER_WEEK + (t.day - 1);
}
var useTimeStore = create()(
  persist(
    (set) => ({
      current: INITIAL_TIME,
      totalDay: 0,
      advance: () => set((s) => {
        const next = nextPhase(s.current);
        return { current: next, totalDay: computeTotalDay(next) };
      }),
      advanceDay: () => set((s) => {
        const next = advanceDayPure(s.current);
        return { current: next, totalDay: computeTotalDay(next) };
      }),
      reset: () => set({ current: INITIAL_TIME, totalDay: 0 }),
      setTime: (time) => set({ current: time, totalDay: computeTotalDay(time) })
    }),
    {
      name: "time",
      storage: createJSONStorage(() => slotAwareStorage)
    }
  )
);

// src/stores/pendingStore.ts
init_esm();

// scripts/sim/_stubs/supabase.ts
var chain = new Proxy(() => chain, {
  get: () => chain,
  apply: () => Promise.resolve({ data: null, error: null })
});
var supabase = new Proxy({}, { get: () => chain });

// src/data/repositories/supabase/discipleCatalogRepo.ts
function mapRow(row) {
  const data = row.data ?? {};
  return {
    id: row.id,
    name: row.name,
    hanjaName: row.hanja_name ?? "",
    starRank: row.star_rank,
    bio: row.bio,
    gender: typeof data.gender === "string" ? data.gender : void 0,
    group: typeof data.group === "string" ? data.group : void 0,
    isPremium: typeof data.isPremium === "boolean" ? data.isPremium : void 0
  };
}
var COLUMNS = "id, name, hanja_name, star_rank, bio, data";
var SupabaseDiscipleCatalogRepo = class {
  async listAll() {
    const { data, error } = await supabase.from("common_disciples").select(COLUMNS).order("star_rank", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  }
  async findById(id) {
    const { data, error } = await supabase.from("common_disciples").select(COLUMNS).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapRow(data) : null;
  }
};

// src/data/repositories/supabase/runsRepo.ts
var RUN_COLUMNS = "id, slot, status, diamonds, game_time, master, sect, schedule, updated_at";
function mapRun(row) {
  return {
    id: row.id,
    slot: row.slot,
    status: row.status,
    diamonds: row.diamonds,
    gameTime: row.game_time ?? {},
    master: row.master,
    sect: row.sect,
    schedule: row.schedule ?? {},
    updatedAt: row.updated_at
  };
}
async function requireUserId() {
  const { data } = await supabase.auth.getUser();
  const id = data.user?.id;
  if (!id) throw new Error("\uC778\uC99D\uB418\uC9C0 \uC54A\uC74C \u2014 \uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.");
  return id;
}
function discipleRows(runId, userId, disciples) {
  return disciples.map((d) => ({
    run_id: runId,
    user_id: userId,
    source_id: d.sourceId,
    name: d.name,
    status: d.status,
    state: d.state
  }));
}
var SupabaseRunRepo = class {
  async listForUser() {
    const { data, error } = await supabase.from("runs").select(RUN_COLUMNS).order("slot", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r) => mapRun(r));
  }
  async getCore(id) {
    const { data: runData, error: runErr } = await supabase.from("runs").select(RUN_COLUMNS).eq("id", id).maybeSingle();
    if (runErr) throw runErr;
    if (!runData) return null;
    const { data: discData, error: discErr } = await supabase.from("run_disciples").select("source_id, name, status, state").eq("run_id", id).order("created_at", { ascending: true });
    if (discErr) throw discErr;
    const disciples = (discData ?? []).map((d) => ({
      sourceId: d.source_id ?? null,
      name: d.name,
      status: d.status,
      state: d.state ?? {}
    }));
    return { run: mapRun(runData), disciples };
  }
  // ── 자식 도메인 로드 (각 슬라이스가 자기 것만) ──
  async getInbox(runId) {
    const { data, error } = await supabase.from("inbox_items").select("payload").eq("run_id", runId).order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => r.payload).filter((p) => p && typeof p === "object");
  }
  async getJianghu(runId) {
    const { data, error } = await supabase.from("jianghu_state").select("factions, events").eq("run_id", runId).maybeSingle();
    if (error) throw error;
    return data ? { factions: data.factions, events: data.events } : null;
  }
  async getAlchemy(runId) {
    const { data, error } = await supabase.from("alchemy_state").select("learned_recipes, active_crafts, first_crafted, lab_operational").eq("run_id", runId).maybeSingle();
    if (error) throw error;
    return data ? {
      learnedRecipes: data.learned_recipes,
      activeCrafts: data.active_crafts,
      firstCrafted: data.first_crafted,
      labOperational: data.lab_operational ?? true
    } : null;
  }
  async getItems(runId) {
    const { data, error } = await supabase.from("items").select("payload").eq("run_id", runId).order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r) => r.payload).filter((p) => p && typeof p === "object");
  }
  async getNpcs(runId) {
    const { data, error } = await supabase.from("run_npcs").select("npc_id, faction, status, data").eq("run_id", runId).order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      npcId: r.npc_id,
      faction: r.faction,
      status: r.status,
      data: r.data ?? {}
    }));
  }
  async saveSlot(payload, disciples) {
    const { data: existing, error: findErr } = await supabase.from("runs").select("id").eq("slot", payload.slot).maybeSingle();
    if (findErr) throw findErr;
    if (existing?.id) {
      await this.update(existing.id, payload, disciples);
      return existing.id;
    }
    const uid = await requireUserId();
    const { data, error } = await supabase.from("runs").insert({
      user_id: uid,
      slot: payload.slot,
      status: payload.status ?? "active",
      diamonds: payload.diamonds,
      game_time: payload.gameTime,
      master: payload.master,
      sect: payload.sect,
      schedule: payload.schedule
    }).select("id").single();
    if (error) throw error;
    const runId = data.id;
    if (disciples.length > 0) {
      const { error: dErr } = await supabase.from("run_disciples").insert(discipleRows(runId, uid, disciples));
      if (dErr) throw dErr;
    }
    return runId;
  }
  async update(id, payload, disciples) {
    const uid = await requireUserId();
    const { error } = await supabase.from("runs").update({
      slot: payload.slot,
      status: payload.status ?? "active",
      diamonds: payload.diamonds,
      game_time: payload.gameTime,
      master: payload.master,
      sect: payload.sect,
      schedule: payload.schedule
    }).eq("id", id);
    if (error) throw error;
    const { error: delErr } = await supabase.from("run_disciples").delete().eq("run_id", id);
    if (delErr) throw delErr;
    if (disciples.length > 0) {
      const { error: insErr } = await supabase.from("run_disciples").insert(discipleRows(id, uid, disciples));
      if (insErr) throw insErr;
    }
  }
  async saveInbox(runId, items) {
    const uid = await requireUserId();
    const { error: delErr } = await supabase.from("inbox_items").delete().eq("run_id", runId);
    if (delErr) throw delErr;
    if (items.length === 0) return;
    const rows = items.map((it) => ({
      run_id: runId,
      user_id: uid,
      kind: it.kind,
      title: it.title,
      preview: it.preview,
      body: it.body,
      priority: it.priority,
      created_at_day: it.createdAtDay,
      read: it.read,
      resolved: it.resolved,
      payload: it.item
    }));
    const { error: insErr } = await supabase.from("inbox_items").insert(rows);
    if (insErr) throw insErr;
  }
  async saveJianghu(runId, state) {
    const uid = await requireUserId();
    const { error } = await supabase.from("jianghu_state").upsert(
      {
        run_id: runId,
        user_id: uid,
        factions: state.factions ?? {},
        events: state.events ?? []
      },
      { onConflict: "run_id" }
    );
    if (error) throw error;
  }
  async saveAlchemy(runId, state) {
    const uid = await requireUserId();
    const { error } = await supabase.from("alchemy_state").upsert(
      {
        run_id: runId,
        user_id: uid,
        learned_recipes: state.learnedRecipes ?? [],
        active_crafts: state.activeCrafts ?? {},
        first_crafted: state.firstCrafted ?? [],
        lab_operational: state.labOperational
      },
      { onConflict: "run_id" }
    );
    if (error) throw error;
  }
  async saveItems(runId, items) {
    const uid = await requireUserId();
    const { error: delErr } = await supabase.from("items").delete().eq("run_id", runId);
    if (delErr) throw delErr;
    if (items.length === 0) return;
    const rows = items.map((it) => ({
      run_id: runId,
      user_id: uid,
      category: it.category,
      item_key: it.itemKey,
      qty: it.qty,
      payload: it.item
    }));
    const { error: insErr } = await supabase.from("items").insert(rows);
    if (insErr) throw insErr;
  }
  async saveNpcs(runId, npcs) {
    const uid = await requireUserId();
    const { error: delErr } = await supabase.from("run_npcs").delete().eq("run_id", runId);
    if (delErr) throw delErr;
    if (npcs.length === 0) return;
    const rows = npcs.map((n) => ({
      run_id: runId,
      user_id: uid,
      npc_id: n.npcId,
      faction: n.faction,
      status: n.status,
      data: n.data
    }));
    const { error: insErr } = await supabase.from("run_npcs").insert(rows);
    if (insErr) throw insErr;
  }
  async delete(id) {
    const { error } = await supabase.from("runs").delete().eq("id", id);
    if (error) throw error;
  }
};

// src/data/repositories/supabase/logsRepo.ts
var SupabaseLogRepo = class {
  async write(entry) {
    try {
      const { data } = await supabase.auth.getUser();
      await supabase.from("app_logs").insert({
        user_id: data.user?.id ?? null,
        run_id: entry.runId ?? null,
        level: entry.level ?? "info",
        source: entry.source ?? null,
        message: entry.message ?? null,
        payload: entry.payload ?? {}
      });
    } catch {
    }
  }
};

// src/data/repositories/index.ts
var discipleCatalog = new SupabaseDiscipleCatalogRepo();
var runs = new SupabaseRunRepo();
var logs = new SupabaseLogRepo();

// scripts/sim/_stubs/expo-fs.ts
var File = class {
  constructor(..._a) {
  }
  get exists() {
    return false;
  }
  create() {
  }
  write() {
  }
  text() {
    return "";
  }
  delete() {
  }
};
var Paths = { document: "", cache: "" };

// src/systems/llm/debugLog.ts
var LOG_FILENAME = "llm-debug.jsonl";
function logFile() {
  return new File(Paths.document, LOG_FILENAME);
}
function logLlmCall(entry) {
  if (true) return;
  const record = { ts: (/* @__PURE__ */ new Date()).toISOString(), ...entry };
  const line = JSON.stringify(record);
  console.log(`[LLM_IO]${line}`);
  try {
    const file = logFile();
    if (!file.exists) file.create();
    const existing = file.textSync();
    file.write(existing + line + "\n");
  } catch (e) {
    if (typeof console !== "undefined") {
      console.warn("[debugLog] \uB85C\uADF8 \uD30C\uC77C \uAE30\uB85D \uC2E4\uD328", e);
    }
  }
}

// src/stores/llmSettingsStore.ts
init_esm();
init_middleware();
init_persistStorage();
var DEFAULT_PER_RUN_CAP = 200;
var useLlmSettingsStore = create()(
  persist(
    (set, get) => ({
      // docs/17 정책: 모든 4선택 모달이 LLM 보정 사용 → enabled 기본 true (필수 다운로드).
      enabled: true,
      perRunCallCount: 0,
      perRunCap: DEFAULT_PER_RUN_CAP,
      loadStatus: "idle",
      downloadProgress: 0,
      setEnabled: (v) => set({ enabled: v }),
      setCap: (n) => set({ perRunCap: Math.max(1, Math.floor(n)) }),
      incrementCallCount: () => set((s) => ({ perRunCallCount: s.perRunCallCount + 1 })),
      resetCounter: () => set({ perRunCallCount: 0 }),
      canCall: () => {
        const s = get();
        return s.enabled && s.loadStatus === "ready" && s.perRunCallCount < s.perRunCap;
      },
      setLoadStatus: (s, error) => set({ loadStatus: s, lastError: error }),
      setDownloadProgress: (p) => set({ downloadProgress: Math.max(0, Math.min(1, p)) })
    }),
    {
      name: "llmSettings",
      storage: createJSONStorage(() => metaStorage),
      version: 2,
      // 카운터는 영속 X — 회차 격리 (seedNewRun 에서 reset).
      // perRunCap 도 persist 제외 — 코드 DEFAULT 값이 항상 우선 (정책 변경 시 즉시 반영).
      partialize: (s) => ({ enabled: s.enabled }),
      // v1 → v2: perRunCap 을 persist 에서 제거 — 옛 저장값 무시하고 enabled 만 보존.
      // 기본 true (필수 다운로드 정책).
      migrate: (persisted) => {
        const safe = persisted ?? {};
        return {
          enabled: typeof safe.enabled === "boolean" ? safe.enabled : true
        };
      }
    }
  )
);

// src/systems/llm/version.ts
var LLM_MODEL_ID = "qwen3-1.7b-quantized";
var LLM_TUNING_VERSION = "2026-06-07.1";

// src/systems/llm/executorchClient.ts
var SYSTEM_PROMPT = [
  "/no_think",
  // Qwen3 추론(thinking) 비활성 — <think> 출력 없이 바로 JSON.
  "\uB108\uB294 \uBB34\uD611 \uC591\uC721 \uC2DC\uBBAC\uB808\uC774\uC158\uC758 \uD6A8\uACFC \uC0B0\uCD9C\uAE30\uB2E4.",
  "\uC0AC\uBD80\uC758 \uC120\uD0DD\uC774 \uC81C\uC790\xB7\uC0AC\uBB38\uC5D0 \uBBF8\uCE5C \uD6A8\uACFC\uB97C \uBD80\uD638 \uC788\uB294 \uC815\uC218 \uBCC0\uB3D9\uAC12\uC73C\uB85C \uD3C9\uAC00\uD55C\uB2E4.",
  '\uBC18\uB4DC\uC2DC effects \uB798\uD37C\uB97C \uD3EC\uD568\uD55C JSON \uD55C \uC904\uB9CC \uCD9C\uB825\uD55C\uB2E4 \u2014 \uC608: {"effects":{"trust":-3}}.',
  "\uCF54\uB4DC\uD39C\uC2A4\xB7\uC124\uBA85\xB7\uD48D\uACBD \uD14D\uC2A4\uD2B8\uB294 \uC808\uB300 \uCD9C\uB825\uD558\uC9C0 \uC54A\uB294\uB2E4.",
  "\uD504\uB86C\uD504\uD2B8\uC758 \uC608\uC2DC \uAC12\uC744 \uADF8\uB300\uB85C \uBCA0\uB07C\uC9C0 \uB9D0\uACE0 \uC0C1\uD669\uC5D0 \uB9DE\uAC8C \uC9C1\uC811 \uACC4\uC0B0\uD55C\uB2E4."
].join(" ");
var loadedModelName = null;
var api = (() => {
  try {
    const m = require("react-native-executorch");
    void m.isAvailable;
    void m.LLMModule;
    void m.QWEN3_1_7B_QUANTIZED;
    return m;
  } catch {
    if (typeof console !== "undefined") {
      console.warn(
        "[llm] react-native-executorch unavailable (Expo Go or native not linked) \u2014 RuleResolver only"
      );
    }
    return null;
  }
})();
function currentModelId() {
  return loadedModelName ?? LLM_MODEL_ID;
}

// src/stores/pendingStore.ts
var usePendingStore = create((set) => ({
  oneLiner: null,
  wish: null,
  dailyLog: null,
  dailyBadges: {},
  milestones: [],
  settlement: null,
  llmDebugBuffer: [],
  lastDebug: null,
  inflightResolutions: 0,
  setOneLiner: (v) => set({ oneLiner: v }),
  clearOneLiner: () => set({ oneLiner: null }),
  setWish: (v) => set({ wish: v }),
  clearWish: () => set({ wish: null }),
  setDailyTick: (log, badges, milestones) => set({ dailyLog: log, dailyBadges: badges, milestones }),
  popMilestone: () => set((s) => ({ milestones: s.milestones.slice(1) })),
  pushMilestones: (list) => set((s) => ({ milestones: [...s.milestones, ...list] })),
  pushLlmDebug: (entry) => {
    logLlmCall(entry);
    const isError = typeof entry.raw === "string" && entry.raw.startsWith("[error]");
    logs.write({
      level: isError ? "error" : "info",
      source: `llm:${entry.source}`,
      message: `${entry.discipleName} \xB7 ${entry.llmCalled ? "LLM \uC751\uB2F5" : "\uB8F0 \uD3F4\uBC31"}`,
      payload: {
        discipleName: entry.discipleName,
        llmCalled: entry.llmCalled,
        prompt: entry.prompt ?? null,
        raw: entry.raw ?? null,
        model: currentModelId(),
        tuningVersion: LLM_TUNING_VERSION
      }
    }).catch(() => {
    });
    set((s) => ({ llmDebugBuffer: [...s.llmDebugBuffer, entry], lastDebug: entry }));
  },
  setSettlement: (v) => set({ settlement: v, llmDebugBuffer: [] }),
  clearSettlement: () => set({ settlement: null }),
  clearLastDebug: () => set({ lastDebug: null }),
  beginResolution: () => set((s) => ({ inflightResolutions: s.inflightResolutions + 1 })),
  endResolution: () => set((s) => ({ inflightResolutions: Math.max(0, s.inflightResolutions - 1) }))
}));

// scripts/sim/extremerisk.ts
init_codexStore();

// src/stores/inboxStore.ts
init_esm();
init_middleware();

// src/types/index.ts
init_realm();

// src/types/inbox.ts
var DECISION_KINDS = [
  "event",
  "meeting_request",
  "quest_offer",
  "complaint",
  "recommendation",
  "visit",
  "diplomacy"
];
function isDecisionKind(kind) {
  return DECISION_KINDS.includes(kind);
}

// src/types/training.ts
var STAT_LABEL = {
  endurance: "\uCCB4\uB825",
  strength: "\uADFC\uB825",
  agility: "\uBBFC\uCCA9",
  formation: "\uC9C4\uBC95",
  etiquette: "\uC608\uC808",
  knowledge: "\uD559\uBB38",
  medicine: "\uC758\uC220",
  alchemy: "\uC601\uC57D\uC81C\uC870",
  scouting: "\uC815\uD0D0",
  guarding: "\uD638\uC704"
};

// src/types/sectAtmosphere.ts
var ATMOSPHERE_MIN = -10;
var ATMOSPHERE_MAX = 10;

// src/stores/inboxStore.ts
init_persistStorage();
var useInboxStore = create()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => set((s) => ({ items: [item, ...s.items] })),
      addMany: (items) => set((s) => ({ items: [...items, ...s.items] })),
      markRead: (id) => set((s) => ({
        items: s.items.map((it) => it.id === id ? { ...it, read: true } : it)
      })),
      markResolved: (id) => set((s) => ({
        items: s.items.map(
          (it) => it.id === id ? { ...it, resolved: true, read: true } : it
        )
      })),
      remove: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
      clearExpired: (currentDay) => set((s) => ({
        items: s.items.filter((it) => {
          if ("expiresAtDay" in it && typeof it.expiresAtDay === "number") {
            return it.expiresAtDay >= currentDay;
          }
          return true;
        })
      })),
      // 적체 방지 — 상한 초과 시 **미해결 결정형 항목(event·면담요청·의뢰제안)을 제외한** 나머지를
      // 오래된 것부터 제거. 풍문·보고·서신·알림 등 정보성은 결정이 없으므로 **읽음 여부와 무관하게** 정리 대상
      // (안 읽어도 손실 없는 정보다). 미해결 결정형은 절대 안 지운다(결정 유실·동결 방지). 매일 호출.
      // 🐛 종전엔 "읽은 것"만 정리해, 서신함을 안 여는(또는 서버 시뮬) 경우 미읽음 풍문/보고가 무한 누적
      //   (15년 5549건 — lifetime 시뮬 발견). 메모리·매턴 직렬화(GameState)·서버 전송을 부풀린다. docs/37.
      prune: (max = 120) => set((s) => {
        if (s.items.length <= max) return s;
        const mustKeep = (it) => !it.resolved && isDecisionKind(it.kind);
        const kept = s.items.filter(mustKeep);
        const room = Math.max(0, max - kept.length);
        const rest = s.items.filter((it) => !mustKeep(it)).slice(0, room);
        const keepIds = new Set([...kept, ...rest].map((it) => it.id));
        return { items: s.items.filter((it) => keepIds.has(it.id)) };
      }),
      unreadCount: () => get().items.filter((it) => !it.read).length,
      // 진행 게이트의 근거 — 미해소 "결정/응답 필요" 수(정본 DECISION_KINDS). >0 이면 진행 불가.
      decisionPendingCount: () => get().items.filter((it) => !it.resolved && isDecisionKind(it.kind)).length,
      reset: () => set({ items: [] })
    }),
    {
      name: "inbox",
      storage: createJSONStorage(() => slotAwareStorage),
      partialize: (s) => ({ items: s.items })
    }
  )
);

// src/utils/korean.ts
function hasBatchim(word) {
  if (!word) return false;
  const c = word.charCodeAt(word.length - 1);
  if (c < 44032 || c > 55203) return false;
  return (c - 44032) % 28 !== 0;
}
function josa(word, withBatchim, withoutBatchim) {
  return word + (hasBatchim(word) ? withBatchim : withoutBatchim);
}
var PARTICLE_PAIRS = {
  \uC740: ["\uC740", "\uB294"],
  \uB294: ["\uC740", "\uB294"],
  \uC774: ["\uC774", "\uAC00"],
  \uAC00: ["\uC774", "\uAC00"],
  \uC744: ["\uC744", "\uB97C"],
  \uB97C: ["\uC744", "\uB97C"],
  \uACFC: ["\uACFC", "\uC640"],
  \uC640: ["\uACFC", "\uC640"],
  \uC73C\uB85C: ["\uC73C\uB85C", "\uB85C"],
  \uB85C: ["\uC73C\uB85C", "\uB85C"],
  \uC544: ["\uC544", "\uC57C"],
  \uC57C: ["\uC544", "\uC57C"]
};
var PARTICLE_ALT = "\uC73C\uB85C|\uC740|\uB294|\uC774|\uAC00|\uC744|\uB97C|\uACFC|\uC640|\uB85C|\uC544|\uC57C";
function fillName(template, map) {
  let out = template;
  for (const [key, name] of Object.entries(map)) {
    const re = new RegExp(`\\{${key}\\}(${PARTICLE_ALT})?`, "g");
    out = out.replace(re, (_m, particle) => {
      if (!particle) return name;
      const pair = PARTICLE_PAIRS[particle];
      return pair ? name + (hasBatchim(name) ? pair[0] : pair[1]) : name + particle;
    });
  }
  return out;
}

// src/systems/rng.ts
var ambientState = 0;
var ambientSeeded = false;
var entropyCounter = 0;
function freshSeed() {
  const t = Date.now();
  return (t ^ t >>> 11 ^ entropyCounter++ * 2654435761) >>> 0;
}
function ensureSeeded() {
  if (ambientSeeded) return;
  ambientState = freshSeed();
  ambientSeeded = true;
}
function seedAmbient(seed) {
  ambientState = seed >>> 0;
  ambientSeeded = true;
}
function random() {
  ensureSeeded();
  ambientState = ambientState + 1831565813 | 0;
  let t = Math.imul(ambientState ^ ambientState >>> 15, 1 | ambientState);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

// src/data/quests.ts
var QUEST_DOMAIN_LABEL = {
  guard: "\uD638\uC704",
  scout: "\uC815\uD0D0",
  duel: "\uACB0\uD22C",
  medicine: "\uC758\uC220",
  assassin: "\uC0B4\uC218",
  grand: "\uD070\uC758\uB8B0"
};
var QUEST_DOMAIN_RIGHTEOUSNESS = {
  guard: 2,
  medicine: 2,
  grand: 2,
  duel: 0,
  scout: 0,
  assassin: -3
};
var QUEST_GRADE_LABEL = {
  menial: "\uC7A1\uC77C",
  minor: "\uC18C\uBB34",
  normal: "\uBCF4\uD1B5",
  dangerous: "\uC704\uD5D8",
  extreme: "\uADF9\uD5D8"
};
var QUEST_GRADE_ORDER = [
  "menial",
  "minor",
  "normal",
  "dangerous",
  "extreme"
];
var QUEST_DOMAIN_STAT = {
  guard: "guarding",
  scout: "scouting",
  duel: null,
  medicine: "medicine",
  assassin: "scouting",
  // 살수 = 정탐·은신 기반
  grand: null
};
var QUEST_GRADE_RISK = {
  menial: { label: "\uC704\uD5D8 \uC5C6\uC74C", injury: false, death: false },
  minor: { label: "\uACBD\uC0C1 \uB4DC\uBB3E", injury: true, death: false },
  normal: { label: "\uBD80\uC0C1 \uAC00\uB2A5", injury: true, death: false },
  dangerous: { label: "\uC911\uC0C1 \uAC00\uB2A5", injury: true, death: false },
  extreme: { label: "\uC0AC\uB9DD \uAC00\uB2A5", injury: true, death: true }
};

// src/data/questEvents.ts
var QUEST_EVENT_CHANCE = {
  menial: 0,
  minor: 0.2,
  normal: 0.4,
  dangerous: 0.6,
  extreme: 0.8
};
var QUEST_EVENTS = [
  {
    id: "qe-dying-stranger",
    domains: ["guard", "medicine", "grand"],
    minGrade: "minor",
    weight: 10,
    prompt: "\uAE38\uC5D0\uC11C \uCE58\uBA85\uC0C1\uC744 \uC785\uC740 \uB0AF\uC120 \uC774\uB97C \uB9CC\uB0AC\uB2E4. \uD589\uC0C9\uB9CC\uC73C\uB860 \uC815\uCCB4\uB97C \uC54C \uC218 \uC5C6\uB2E4 \u2014 \uC190\uC4F0\uC9C0 \uC54A\uC73C\uBA74 \uACE7 \uC228\uC774 \uB04A\uAE34\uB2E4.",
    choices: [
      {
        key: "heal-skill",
        label: "\uC758\uC220\uB85C \uC9C1\uC811 \uC0B4\uB9B0\uB2E4",
        roll: { by: "medicine", base: 0.2 },
        effect: { revealRescue: true, persona: { mercy: 3 }, resultText: "\uB2A5\uC219\uD55C \uC190\uAE38\uB85C \uADF8\uB97C \uC0B4\uB824\uB0C8\uB2E4." },
        failEffect: { persona: { mercy: 1 }, stressDelta: 8, resultText: "\uC190\uC744 \uB2E4 \uC37C\uC9C0\uB9CC \uB05D\uB0B4 \uC228\uC774 \uB04A\uACBC\uB2E4." }
      },
      {
        key: "heal-elixir",
        label: "\uC601\uC57D\uC744 \uC368\uC11C \uC0B4\uB9B0\uB2E4 (\uC790\uAE08)",
        require: { money: 20 },
        effect: { revealRescue: true, persona: { mercy: 2 }, resultText: "\uC601\uC57D\uC73C\uB85C \uBAA9\uC228\uC744 \uAC74\uC84C\uB2E4." }
      },
      {
        key: "heal-village",
        label: "\uB9C8\uC744\uC5D0 \uB3C4\uC6C0\uC744 \uCCAD\uD55C\uB2E4",
        roll: { by: "medicine", base: 0.4 },
        effect: { successDelta: -0.08, revealRescue: true, persona: { mercy: 1 }, resultText: "\uC2DC\uAC04\uC740 \uB04C\uB838\uC9C0\uB9CC \uC0B4\uB824\uB0C8\uB2E4." },
        failEffect: { stressDelta: 6, resultText: "\uB3C4\uC6C0\uC774 \uB2FF\uAE30\uC5D4 \uB2A6\uC5C8\uB2E4." }
      },
      {
        key: "ignore",
        label: "\uC678\uBA74\uD558\uACE0 \uC784\uBB34\uB97C \uAC04\uB2E4",
        effect: { persona: { mercy: -4 }, stressDelta: 18, resultText: "\uB4F1 \uB4A4\uC758 \uC2E0\uC74C\uC744 \uB05D\uB0B4 \uC678\uBA74\uD588\uB2E4." }
      }
    ]
  },
  {
    id: "qe-sapa-raid",
    domains: ["guard", "duel", "scout", "grand"],
    minGrade: "normal",
    weight: 9,
    prompt: "\uC9C0\uB098\uB294 \uB9C8\uC744\uC774 \uC0AC\uD30C \uBB34\uB9AC\uC5D0\uAC8C \uC9D3\uBC1F\uD788\uACE0 \uC788\uB2E4. \uBE44\uBA85\uC774 \uB4E4\uB9B0\uB2E4.",
    choices: [
      {
        key: "fight",
        label: "\uB9DE\uC11C \uC2F8\uC6CC \uB9C9\uB294\uB2E4",
        roll: { by: "martial", base: 0.2 },
        effect: { rewardFlag: "noble", persona: { integrity: 3, mercy: 2 }, resultText: "\uC0AC\uD30C\uB97C \uBAB0\uC544\uB0B4\uACE0 \uB9C8\uC744\uC744 \uC9C0\uCF30\uB2E4." },
        failEffect: { riskDelta: 0.2, persona: { mercy: 1 }, resultText: "\uC911\uACFC\uBD80\uC801, \uAC04\uC2E0\uD788 \uBAB8\uB9CC \uBE90\uB2E4." }
      },
      {
        key: "help-careful",
        label: "\uC2E0\uC911\uD788 \uC0AC\uB78C\uB9CC \uAD6C\uD55C\uB2E4",
        roll: { by: "martial", base: 0.45 },
        effect: { persona: { mercy: 2 }, resultText: "\uC0AC\uB78C\uB4E4\uC744 \uBE7C\uB0C8\uB2E4." },
        failEffect: { riskDelta: 0.1, resultText: "\uBA87\uC740 \uB05D\uB0B4 \uAD6C\uD558\uC9C0 \uBABB\uD588\uB2E4." }
      },
      {
        key: "pass",
        label: "\uC784\uBB34\uB97C \uC6B0\uC120\uD574 \uC9C0\uB098\uCE5C\uB2E4",
        effect: { persona: { mercy: -3 }, stressDelta: 12, resultText: "\uBE44\uBA85\uC744 \uB4A4\uB85C\uD558\uACE0 \uAE38\uC744 \uAC14\uB2E4." }
      }
    ]
  },
  {
    id: "qe-ambush",
    domains: ["guard", "duel", "scout", "grand", "assassin"],
    minGrade: "normal",
    weight: 7,
    prompt: "\uC881\uC740 \uAE38\uBAA9\uC5D0 \uB9E4\uBCF5\uC774 \uAE54\uB838\uB2E4.",
    choices: [
      { key: "breakthrough", label: "\uC815\uBA74 \uB3CC\uD30C\uD55C\uB2E4", roll: { by: "martial", base: 0.35 }, effect: { successDelta: 0.05, resultText: "\uB6AB\uACE0 \uB098\uAC14\uB2E4." }, failEffect: { riskDelta: 0.1, resultText: "\uB09C\uC804 \uB05D\uC5D0 \uC0C1\uCC98\uB97C \uC785\uC5C8\uB2E4." } },
      { key: "detour", label: "\uC6B0\uD68C\uD55C\uB2E4", roll: { by: "scouting", base: 0.4 }, effect: { successDelta: -0.05, resultText: "\uAE38\uC744 \uB3CC\uC544 \uD53C\uD588\uB2E4." }, failEffect: { riskDelta: 0.05, resultText: "\uB3CC\uC544\uAC00\uB2E4 \uBC1C\uAC01\uB410\uB2E4." } },
      { key: "bribe", label: "\uB3C8\uC73C\uB85C \uAE38\uC744 \uC0B0\uB2E4", require: { money: 10 }, effect: { rewardMult: 0.9, resultText: "\uAC12\uC744 \uCE58\uB974\uACE0 \uC9C0\uB0AC\uB2E4." } }
    ]
  },
  {
    id: "qe-trap",
    domains: ["scout", "grand"],
    minGrade: "dangerous",
    weight: 8,
    prompt: "\uC55E\uC744 \uAE30\uAD00(\u9663)\uC774 \uB9C9\uC558\uB2E4. \uB354 \uAE4A\uC774 \uB4E4\uC5B4\uAC00\uBA74 \uC704\uD5D8\uD558\uB098, \uADF8\uB9CC\uD07C \uC5BB\uC744 \uAC83\uB3C4 \uD06C\uB2E4.",
    choices: [
      { key: "formation", label: "\uC9C4\uBC95\uC744 \uC77D\uC5B4 \uB3CC\uD30C\uD55C\uB2E4", roll: { by: "formation", base: 0.15 }, effect: { rewardMult: 1.3, successDelta: 0.1, resultText: "\uAE30\uAD00\uC744 \uAC04\uD30C\uD574 \uC548\uC804\uD788 \uC9C0\uB0AC\uB2E4." }, failEffect: { riskDelta: 0.15, resultText: "\uAE30\uAD00\uC744 \uC798\uBABB \uC9DA\uC5B4 \uC704\uD5D8\uC5D0 \uBE60\uC84C\uB2E4." } },
      { key: "evade", label: "\uBAB8\uB180\uB9BC\uC73C\uB85C \uD53C\uD55C\uB2E4", roll: { by: "martial", base: 0.3 }, effect: { rewardMult: 1.15, resultText: "\uC544\uC2AC\uD558\uAC8C \uD53C\uD574 \uB098\uC544\uAC14\uB2E4." }, failEffect: { riskDelta: 0.2, resultText: "\uAE30\uAD00\uC5D0 \uAC78\uB824 \uD06C\uAC8C \uB2E4\uCCE4\uB2E4." } },
      { key: "reckless", label: "\uBB34\uC791\uC815 \uB4E4\uC5B4\uAC04\uB2E4", effect: { rewardMult: 1.3, riskDelta: 0.28, resultText: "\uC6B4\uC5D0 \uB9E1\uAE30\uACE0 \uB6F0\uC5B4\uB4E4\uC5C8\uB2E4." } },
      { key: "retreat", label: "\uB3CC\uC544 \uB098\uC628\uB2E4", effect: { resultText: "\uBB34\uB9AC\uD558\uC9C0 \uC54A\uACE0 \uBB3C\uB7EC\uC130\uB2E4." } }
    ]
  },
  {
    id: "qe-detected",
    domains: ["scout", "assassin"],
    minGrade: "normal",
    weight: 7,
    prompt: "\uBC1C\uAC01\uB418\uAE30 \uC9C1\uC804\uC774\uB2E4.",
    choices: [
      { key: "hide", label: "\uC228\uC8FD\uC5EC \uC740\uC2E0\uD55C\uB2E4", roll: { by: "scouting", base: 0.3 }, effect: { successDelta: 0.1, resultText: "\uADF8\uB9BC\uC790\uC5D0 \uBAB8\uC744 \uC228\uACBC\uB2E4." }, failEffect: { riskDelta: 0.1, resultText: "\uB4E4\uCF1C \uCAD3\uACBC\uB2E4." } },
      { key: "smoke", label: "\uC5F0\uB9C9\uC744 \uCE58\uACE0 \uB3C4\uC8FC\uD55C\uB2E4", roll: { by: "martial", base: 0.4 }, effect: { resultText: "\uC5F0\uB9C9 \uC18D\uC73C\uB85C \uC0AC\uB77C\uC84C\uB2E4." }, failEffect: { riskDelta: 0.1, resultText: "\uB3C4\uC8FC \uC911 \uBD80\uC0C1\uC744 \uC785\uC5C8\uB2E4." } },
      { key: "force", label: "\uC815\uBA74 \uB3CC\uD30C\uD55C\uB2E4", roll: { by: "martial", base: 0.3 }, effect: { successDelta: 0.05, resultText: "\uBCA0\uACE0 \uBE60\uC838\uB098\uC654\uB2E4." }, failEffect: { riskDelta: 0.1, resultText: "\uC5D0\uC6CC\uC2F8\uC5EC \uC0C1\uCC98\uB97C \uC785\uC5C8\uB2E4." } }
    ]
  },
  {
    id: "qe-surrender",
    domains: ["duel", "grand"],
    minGrade: "dangerous",
    weight: 6,
    prompt: "\uC4F0\uB7EC\uC9C4 \uC801\uC774 \uBAA9\uC228\uC744 \uAD6C\uAC78\uD55C\uB2E4.",
    choices: [
      { key: "spare", label: "\uC0B4\uB824 \uBCF4\uB0B8\uB2E4", effect: { persona: { mercy: 3, integrity: 1 }, rewardMult: 0.95, resultText: "\uCE7C\uC744 \uAC70\uB450\uC5C8\uB2E4." } },
      { key: "kill", label: "\uBCA0\uC5B4 \uD654\uADFC\uC744 \uC5C6\uC564\uB2E4", effect: { persona: { mercy: -3 }, successDelta: 0.05, resultText: "\uB4A4\uB97C \uB0A8\uAE30\uC9C0 \uC54A\uC558\uB2E4." } }
    ]
  },
  {
    id: "qe-innocent-target",
    domains: ["assassin"],
    minGrade: "normal",
    weight: 9,
    prompt: "\uD45C\uC801\uC774 \uC54C\uACE0 \uBCF4\uB2C8 \uC8C4 \uC5C6\uB294 \uC790\uC600\uB2E4.",
    choices: [
      { key: "proceed", label: "\uADF8\uB798\uB3C4 \uCC98\uB9AC\uD55C\uB2E4", effect: { persona: { mercy: -5 }, resultText: "\uCCAD\uBD80\uB294 \uCCAD\uBD80\uB2E4. \uC190\uC744 \uB354\uB7FD\uD614\uB2E4." } },
      { key: "refuse", label: "\uAC70\uBD80\uD558\uACE0 \uB3CC\uC544\uC628\uB2E4", effect: { successDelta: -1, persona: { mercy: 4, integrity: 2 }, resultText: "\uCE7C\uC744 \uAC70\uB450\uB2C8 \uC758\uB8B0\uC778\uC774 \uB4F1\uC744 \uB3CC\uB838\uB2E4." } }
    ]
  },
  {
    id: "qe-plague",
    domains: ["medicine"],
    minGrade: "normal",
    weight: 7,
    prompt: "\uC5ED\uBCD1\uC774 \uB3C4\uB294 \uB9C8\uC744. \uCE58\uB8CC\uD558\uB824\uBA74 \uC790\uC2E0\uB3C4 \uAC10\uC5FC\uC744 \uBB34\uB985\uC368\uC57C \uD55C\uB2E4.",
    choices: [
      { key: "treat", label: "\uC704\uD5D8\uC744 \uBB34\uB985\uC4F0\uACE0 \uCE58\uB8CC\uD55C\uB2E4", roll: { by: "medicine", base: 0.25 }, effect: { persona: { mercy: 3 }, resultText: "\uB9C8\uC744\uC744 \uC5ED\uBCD1\uC5D0\uC11C \uAD6C\uD588\uB2E4." }, failEffect: { riskDelta: 0.15, persona: { mercy: 1 }, resultText: "\uC5ED\uBCD1\uC744 \uB9C9\uC9C0 \uBABB\uD558\uACE0 \uC790\uC2E0\uB3C4 \uC553\uC558\uB2E4." } },
      { key: "distance", label: "\uAC70\uB9AC\uB97C \uB454\uB2E4", effect: { persona: { mercy: -2 }, stressDelta: 8, resultText: "\uB3CC\uC544\uC11C\uB294 \uBC1C\uC774 \uBB34\uAC70\uC6E0\uB2E4." } }
    ]
  },
  {
    id: "qe-shortcut",
    domains: ["guard"],
    minGrade: "normal",
    weight: 6,
    prompt: "\uD638\uC704 \uB300\uC0C1\uC774 \uC704\uD5D8\uD55C \uC9C0\uB984\uAE38\uC744 \uACE0\uC9D1\uD55C\uB2E4.",
    choices: [
      { key: "follow", label: "\uB73B\uC744 \uB530\uB978\uB2E4", effect: { rewardMult: 1.2, riskDelta: 0.1, resultText: "\uC9C0\uB984\uAE38\uB85C \uB4E4\uC5C8\uB2E4." } },
      { key: "safe", label: "\uC548\uC804\uD55C \uAE38\uC744 \uACE0\uC9D1\uD55C\uB2E4", effect: { successDelta: -0.05, persona: { prudence: 1 }, resultText: "\uB3CC\uC544\uAC00\uB354\uB77C\uB3C4 \uC548\uC804\uC744 \uD0DD\uD588\uB2E4." } }
    ]
  },
  {
    id: "qe-wounded-ally",
    domains: ["guard", "duel", "scout", "grand"],
    minGrade: "dangerous",
    weight: 6,
    prompt: "\uB3D9\uD589\uC774 \uD06C\uAC8C \uB2E4\uCCE4\uB2E4. \uC784\uBB34\uB294 \uC544\uC9C1 \uB05D\uB098\uC9C0 \uC54A\uC558\uB2E4.",
    choices: [
      { key: "treat", label: "\uBA48\uCDB0 \uCE58\uB8CC\uD55C\uB2E4", roll: { by: "medicine", base: 0.4 }, effect: { successDelta: -0.05, persona: { warmth: 2 }, resultText: "\uC0C1\uCC98\uB97C \uB2E4\uC2A4\uB824 \uB370\uB9AC\uACE0 \uAC14\uB2E4." }, failEffect: { riskDelta: 0.05, resultText: "\uCE58\uB8CC\uAC00 \uC5B4\uC124\uD37C \uC0C1\uCC98\uAC00 \uB367\uB0AC\uB2E4." } },
      { key: "carry", label: "\uC5C5\uACE0 \uAC15\uD589\uD55C\uB2E4", roll: { by: "guarding", base: 0.4 }, effect: { riskDelta: 0.05, persona: { warmth: 1 }, resultText: "\uB4E4\uCCD0\uC5C5\uACE0 \uC784\uBB34\uB97C \uB9C8\uCCE4\uB2E4." }, failEffect: { riskDelta: 0.1, resultText: "\uBB34\uB9AC\uD558\uB2E4 \uB458 \uB2E4 \uC704\uD0DC\uB85C\uC6E0\uB2E4." } },
      { key: "leave", label: "\uB450\uACE0 \uC784\uBB34\uB97C \uB9C8\uCE5C\uB2E4", effect: { persona: { mercy: -3, warmth: -2 }, stressDelta: 15, resultText: "\uB3D9\uBB38\uC744 \uB450\uACE0 \uAE38\uC744 \uAC14\uB2E4." } }
    ]
  }
];

// src/systems/questSystem.ts
init_martialArts();
init_codexStore();
init_realm2();

// src/stores/fieldEventStore.ts
init_esm();
init_middleware();
init_persistStorage();
var useFieldEventStore = create()(
  persist(
    (set) => ({
      queue: [],
      push: (e) => set((s) => ({ queue: [...s.queue, e] })),
      pop: () => set((s) => ({ queue: s.queue.slice(1) })),
      clear: () => set({ queue: [] })
    }),
    {
      name: "fieldEvent",
      storage: createJSONStorage(() => slotAwareStorage),
      version: 1,
      partialize: (s) => ({ queue: s.queue })
    }
  )
);

// src/stores/sectAtmosphereStore.ts
init_esm();
init_middleware();
init_persistStorage();
var DEFAULT_ATMOSPHERE = {
  righteousness: 0,
  unity: 0
};
function clamp(v) {
  return Math.max(ATMOSPHERE_MIN, Math.min(ATMOSPHERE_MAX, v));
}
var useSectAtmosphereStore = create()(
  persist(
    (set) => ({
      atmosphere: DEFAULT_ATMOSPHERE,
      adjust: (d) => set((s) => ({
        atmosphere: {
          righteousness: clamp(s.atmosphere.righteousness + (d.righteousness ?? 0)),
          unity: clamp(s.atmosphere.unity + (d.unity ?? 0))
        }
      })),
      set: (v) => set({ atmosphere: { righteousness: clamp(v.righteousness), unity: clamp(v.unity) } }),
      reset: () => set({ atmosphere: DEFAULT_ATMOSPHERE })
    }),
    {
      name: "sectAtmosphere",
      storage: createJSONStorage(() => slotAwareStorage),
      version: 1,
      partialize: (s) => ({ atmosphere: s.atmosphere })
    }
  )
);

// src/data/factions.ts
var FACTIONS = [
  // ── 구파일방 (소림·무당·화산·종남·곤륜·아미·점창·청성·공동 + 개방) ──
  { id: "sorim", name: "\uC18C\uB9BC", hanjaName: "\u5C11\u6797", group: "gupa", alignment: "right", blurb: "\uBD88\uBB38 \uBB34\uD559\uC758 \uC885\uC8FC." },
  { id: "mudang", name: "\uBB34\uB2F9", hanjaName: "\u6B66\u7576", group: "gupa", alignment: "right", blurb: "\uB3C4\uAC00 \uAC80\uD559\uC758 \uD0DC\uC0B0\uBD81\uB450." },
  { id: "hwasan", name: "\uD654\uC0B0", hanjaName: "\u83EF\u5C71", group: "gupa", alignment: "right", blurb: "\uB9E4\uD654\uAC80\uC758 \uBA85\uBB38." },
  { id: "jongnam", name: "\uC885\uB0A8", hanjaName: "\u7D42\u5357", group: "gupa", alignment: "right", blurb: "\uAD00\uC911\uC758 \uAC80\uD30C." },
  { id: "gonryun", name: "\uACE4\uB95C", hanjaName: "\u5D11\u5D19", group: "gupa", alignment: "right", blurb: "\uC11C\uC5ED\uC758 \uCF8C\uAC80." },
  { id: "amisan", name: "\uC544\uBBF8", hanjaName: "\u5CE8\u5D4B", group: "gupa", alignment: "right", blurb: "\uBE44\uAD6C\uB2C8 \uAC80\uBB38." },
  { id: "jeomchang", name: "\uC810\uCC3D", hanjaName: "\u9EDE\u84BC", group: "gupa", alignment: "right", blurb: "\uC6B4\uB0A8\uC758 \uCF8C\uAC80." },
  { id: "cheongseong", name: "\uCCAD\uC131", hanjaName: "\u9751\u57CE", group: "gupa", alignment: "right", blurb: "\uCD09\uC758 \uAC80\uD30C." },
  { id: "gongdong", name: "\uACF5\uB3D9", hanjaName: "\u5D06\u5CD2", group: "gupa", alignment: "right", blurb: "\uC11C\uBD81\uC758 \uAD8C\uAC01." },
  { id: "gaebang", name: "\uAC1C\uBC29", hanjaName: "\u4E10\u5E47", group: "gupa", alignment: "middle", blurb: "\uCC9C\uD558 \uAC70\uC9C0\uC758 \uC815\uBCF4\uB9DD." },
  // ── 오대세가 (당문은 독문이라 별도 — docs/01) ──
  { id: "namgung", name: "\uB0A8\uAD81\uC138\uAC00", hanjaName: "\u5357\u5BAE\u4E16\u5BB6", group: "segga", alignment: "right", blurb: "\uAC80\uAC00\uC758 \uBA85\uBB38." },
  { id: "jegal", name: "\uC81C\uAC08\uC138\uAC00", hanjaName: "\u8AF8\u845B\u4E16\u5BB6", group: "segga", alignment: "right", blurb: "\uC9C4\uBC95\xB7\uC9C0\uB7B5\uC758 \uAC00\uBB38." },
  { id: "paeng", name: "\uD558\uBD81\uD33D\uAC00", hanjaName: "\u6CB3\u5317\u5F6D\u5BB6", group: "segga", alignment: "right", blurb: "\uB3C4\uBC95\uC758 \uAC15\uB9F9\uD55C \uAC00\uBB38." },
  { id: "moyong", name: "\uBAA8\uC6A9\uC138\uAC00", hanjaName: "\u6155\u5BB9\u4E16\u5BB6", group: "segga", alignment: "right", blurb: "\uCF8C\uAC80\uC758 \uAC15\uB0A8 \uBA85\uAC00." },
  { id: "hwangbo", name: "\uD669\uBCF4\uC138\uAC00", hanjaName: "\u7687\u752B\u4E16\u5BB6", group: "segga", alignment: "right", blurb: "\uAD8C\xB7\uC678\uACF5\uC758 \uAC00\uBB38." },
  // ── 무림맹 (구파·세가 연합의 정점) ──
  { id: "murimmaeng", name: "\uBB34\uB9BC\uB9F9", hanjaName: "\u6B66\u6797\u76DF", group: "maeng", alignment: "right", blurb: "\uC815\uD30C \uC5F0\uD569\uC758 \uC815\uC810." },
  // ── 사파·마교 (정파 평판과 반대로 움직임) ──
  { id: "nokrim", name: "\uB179\uB9BC", hanjaName: "\u7DA0\u6797", group: "sapa", alignment: "sapa", blurb: "\uAC15\uB0A8 \uC0AC\uD30C\uC758 \uAC70\uB450." },
  { id: "haomun", name: "\uD558\uC624\uBB38", hanjaName: "\u4E0B\u6C5A\u9580", group: "sapa", alignment: "sapa", blurb: "\uB4B7\uACE8\uBAA9 \uC815\uBCF4\uC758 \uADF8\uBB3C." },
  { id: "magyo", name: "\uB9C8\uAD50", hanjaName: "\u9B54\u654E", group: "magyo", alignment: "magyo", blurb: "\uAC15\uD638\uAC00 \uB450\uB824\uC6CC\uD558\uB294 \uADF8\uB9BC\uC790." }
];
var REP_MIN = -100;
var REP_MAX = 100;

// src/stores/reputationStore.ts
init_esm();
init_middleware();
init_persistStorage();
var clampRep = (n) => Math.max(REP_MIN, Math.min(REP_MAX, n));
var useReputationStore = create()(
  persist(
    (set, get) => ({
      sect: {},
      disciple: {},
      sectRep: (factionId) => get().sect[factionId] ?? 0,
      discipleRep: (discipleId, factionId) => get().disciple[discipleId]?.[factionId] ?? 0,
      adjustSect: (factionId, delta) => set((s) => ({
        sect: { ...s.sect, [factionId]: clampRep((s.sect[factionId] ?? 0) + delta) }
      })),
      adjustDisciple: (discipleId, factionId, delta) => set((s) => {
        const cur = s.disciple[discipleId] ?? {};
        return {
          disciple: {
            ...s.disciple,
            [discipleId]: { ...cur, [factionId]: clampRep((cur[factionId] ?? 0) + delta) }
          }
        };
      }),
      setDisciple: (discipleId, factionId, value) => set((s) => {
        const cur = s.disciple[discipleId] ?? {};
        return {
          disciple: {
            ...s.disciple,
            [discipleId]: { ...cur, [factionId]: clampRep(value) }
          }
        };
      }),
      reset: () => set({ sect: {}, disciple: {} })
    }),
    {
      name: "reputation",
      storage: createJSONStorage(() => slotAwareStorage)
    }
  )
);

// src/stores/jianghuStore.ts
init_esm();
init_middleware();

// src/data/worldPowers.ts
var WORLD_BLOCS = [
  "orthodox",
  "unorthodox",
  "demonic",
  "neutral",
  "imperial"
];
var BLOC_LABEL = {
  orthodox: "\uC815\uD30C",
  unorthodox: "\uC0AC\uD30C",
  demonic: "\uB9C8\uAD50",
  neutral: "\uC911\uB3C4",
  imperial: "\uAD00\xB7\uAD70"
};
var BLOC_DEF = {
  orthodox: { base: 72, floor: 50, volatility: 0.8 },
  // 정통 — 두텁고 안 무너짐
  unorthodox: { base: 46, floor: 8, volatility: 1.25 },
  // 사파 — 봉기·토벌로 크게 출렁
  demonic: { base: 40, floor: 6, volatility: 1.35 },
  // 마교 — 잠복·준동 진폭 큼
  neutral: { base: 38, floor: 12, volatility: 0.9 },
  // 중도(표국·개방)
  imperial: { base: 55, floor: 30, volatility: 0.7 }
  // 관·군 — 평소 강호 거리 둠
};
var RIVALRIES = [
  // 기본 긴장은 낮게 깔린다(평온이 기본) — 갈등은 사건이 만든다. 그래서 한 축이 전쟁이어도 다른 축은 평온할 수 있다.
  { a: "orthodox", b: "demonic", drift: 2.8, label: "\uC815\uB9C8\uB300\uB9BD" },
  // 마교 준동이 끌어올림
  { a: "orthodox", b: "unorthodox", drift: 2.4, label: "\uC815\uC0AC\uD56D\uC7C1" },
  // 사파 봉기가 끌어올림
  { a: "unorthodox", b: "demonic", drift: 1.9, label: "\uC0AC\uB9C8\uACAC\uC81C" },
  // 독립 축 — 사마 패권 다툼이 키운다(드물게 사마대전)
  { a: "orthodox", b: "imperial", drift: 0.8, label: "\uAD00\uBB34\uC54C\uB825" },
  // 관과 강호의 미묘한 거리
  { a: "unorthodox", b: "imperial", drift: 1.7, label: "\uAD00\uC801\uD1A0\uBC8C" }
  // 독립 축 — 관의 사파 토벌이 키운다
];
function blocPairKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}
var STANCE_THRESHOLD = [
  { at: 86, stance: "war" },
  { at: 66, stance: "clash" },
  { at: 46, stance: "tension" },
  { at: 26, stance: "restless" },
  { at: 0, stance: "calm" }
];
function tensionToStance(t) {
  for (const row of STANCE_THRESHOLD) if (t >= row.at) return row.stance;
  return "calm";
}
var STANCE_RANK = {
  calm: 0,
  restless: 1,
  tension: 2,
  clash: 3,
  war: 4
};
var STANCE_LABEL = {
  calm: "\uD3C9\uC628",
  restless: "\uC220\uB801\uC784",
  tension: "\uAE34\uC7A5",
  clash: "\uCDA9\uB3CC",
  war: "\uC804\uC7C1"
};

// src/systems/worldState.ts
function getTension(s, a, b) {
  return s.tensions[blocPairKey(a, b)] ?? 0;
}
function recomputeStances(s) {
  for (const bloc of Object.keys(s.powers)) {
    let best = "calm";
    for (const r of RIVALRIES) {
      const other = r.a === bloc ? r.b : r.b === bloc ? r.a : null;
      if (!other) continue;
      const st = tensionToStance(getTension(s, bloc, other));
      if (STANCE_RANK[st] > STANCE_RANK[best]) best = st;
    }
    s.powers[bloc].stance = best;
  }
}

// src/systems/worldSystem.ts
var noise = (rng, mag) => (rng() - 0.5) * 2 * mag;
var clamp2 = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
function powerWord(p) {
  if (p >= 75) return "\uC138\uAC00 \uB4DC\uB192\uB2E4";
  if (p >= 55) return "\uC138 \uB450\uD141\uB2E4";
  if (p >= 35) return "\uC138\uB97C \uC9C0\uD0A8\uB2E4";
  if (p >= 18) return "\uC1E0\uD55C \uAE30\uC0C9";
  return "\uBFCC\uB9AC\uB9CC \uB0A8\uC558\uB2E4";
}
function outlookFor(power) {
  return `${STANCE_LABEL[power.stance]} \xB7 ${powerWord(power.power)}`;
}
function refreshOutlooks(s) {
  for (const bloc of WORLD_BLOCS) {
    const p = s.powers[bloc];
    if (p) p.outlook = outlookFor(p);
  }
}
function seedWorldState(rng = random) {
  const powers = {};
  for (const bloc of WORLD_BLOCS) {
    const base = BLOC_DEF[bloc].base + Math.round(noise(rng, 4));
    powers[bloc] = {
      id: bloc,
      label: BLOC_LABEL[bloc],
      power: clamp2(base, BLOC_DEF[bloc].floor, 100),
      stance: "calm",
      outlook: ""
    };
  }
  const tensions = {};
  for (const r of RIVALRIES) {
    tensions[blocPairKey(r.a, r.b)] = clamp2(r.drift * 4 + noise(rng, 6), 0, 60);
  }
  const s = { season: 0, powers, tensions, events: [] };
  recomputeStances(s);
  refreshOutlooks(s);
  return s;
}

// src/stores/jianghuStore.ts
init_persistStorage();
function deriveFactions(w) {
  return WORLD_BLOCS.map((b) => w.powers[b]).filter(Boolean);
}
function deriveEvents(w) {
  return w.events.filter((e) => !e.done).sort((a, b) => b.startedSeason - a.startedSeason);
}
var useJianghuStore = create()(
  persist(
    (set) => ({
      world: null,
      factions: [],
      events: [],
      setWorld: (w) => set({ world: w, factions: deriveFactions(w), events: deriveEvents(w) }),
      hydrateWorld: (w) => set({ world: w, factions: deriveFactions(w), events: deriveEvents(w) }),
      seedDefaults: () => {
        const w = seedWorldState();
        set({ world: w, factions: deriveFactions(w), events: deriveEvents(w) });
      },
      reset: () => {
        const w = seedWorldState();
        set({ world: w, factions: deriveFactions(w), events: deriveEvents(w) });
      }
    }),
    {
      name: "jianghu",
      storage: createJSONStorage(() => slotAwareStorage)
    }
  )
);

// src/systems/reputationSystem.ts
function adjustSectRep(factionId, delta) {
  if (delta === 0) return;
  useReputationStore.getState().adjustSect(factionId, delta);
}
function adjustDiscipleRep(discipleId, factionId, delta) {
  if (delta === 0) return;
  useReputationStore.getState().adjustDisciple(discipleId, factionId, delta);
}
function applyAlignmentReputation(righteousness, outcomeScale, presentDiscipleIds = []) {
  if (righteousness === 0 || outcomeScale <= 0) return;
  const store2 = useReputationStore.getState();
  const base = Math.sign(righteousness) * Math.max(1, Math.round(Math.abs(righteousness) * 0.6 * outcomeScale));
  for (const f of FACTIONS) {
    let delta = 0;
    if (f.alignment === "right") delta = base;
    else if (f.alignment === "sapa" || f.alignment === "magyo") delta = -base;
    else continue;
    store2.adjustSect(f.id, delta);
    const half = delta > 0 ? Math.ceil(delta / 2) : Math.floor(delta / 2);
    if (half !== 0) {
      for (const id of presentDiscipleIds) store2.adjustDisciple(id, f.id, half);
    }
  }
}
function applyCovertReputation(magnitude, exposure, credit, presentDiscipleIds = []) {
  const store2 = useReputationStore.getState();
  for (const f of FACTIONS) {
    let delta = 0;
    if (f.alignment === "right") delta = -Math.round(magnitude * exposure);
    else if (f.alignment === "sapa" || f.alignment === "magyo") delta = Math.round(magnitude * credit);
    else continue;
    if (delta === 0) continue;
    store2.adjustSect(f.id, delta);
    const half = delta > 0 ? Math.ceil(delta / 2) : Math.floor(delta / 2);
    if (half !== 0) {
      for (const id of presentDiscipleIds) store2.adjustDisciple(id, f.id, half);
    }
  }
}

// src/systems/discipleCtx.ts
function currentAge(d) {
  const year = useTimeStore.getState().current.year;
  return (d.age ?? 10) + Math.max(0, year - (d.entryYear ?? year));
}

// src/systems/personaShift.ts
function ageCoef(age) {
  if (age <= 10) return 1.5;
  if (age <= 12) return 1.2;
  if (age <= 14) return 1;
  if (age <= 16) return 0.7;
  return 0.3;
}
function inertiaCoef(value, delta) {
  const x = delta >= 0 ? value : 100 - value;
  if (x >= 80) return 2;
  if (x >= 60) return 1.5;
  if (x >= 40) return 1;
  if (x >= 20) return 0.5;
  return 0.2;
}
function effectivePersonaDelta(value, rawDelta, age) {
  if (!rawDelta) return 0;
  return Math.round(rawDelta * ageCoef(age) * inertiaCoef(value, rawDelta));
}
function shiftPersona(d, deltas) {
  const age = currentAge(d);
  const next = { ...d.personality };
  for (const k of Object.keys(deltas)) {
    const raw = deltas[k];
    if (!raw) continue;
    const eff = effectivePersonaDelta(next[k], raw, age);
    next[k] = Math.max(1, Math.min(100, next[k] + eff));
  }
  return next;
}

// src/systems/martialExp.ts
init_martialArts();
init_realm2();
var TRICKLE_RATE = 0.3;
function gainMainSeongExpArts(d, expIn) {
  const mainId = d.mainMartialArtId ?? d.martialArts[0]?.artId;
  if (!mainId || expIn <= 0) return null;
  const art = findMartialArt(mainId);
  if (!art) return null;
  const exp = Math.max(1, Math.round(expIn * GRADE_LEARN_MULT[art.grade]));
  const cap = Math.min(seongCap(art.grade), REALM_SEONG_CAP[d.realm]);
  const martialArts = d.martialArts.map((a) => {
    if (a.artId !== mainId) return a;
    let seong = a.seong;
    let e = a.exp + exp;
    while (seong < cap && e >= expToNextSeong(seong)) {
      e -= expToNextSeong(seong);
      seong += 1;
    }
    if (seong >= cap) {
      seong = cap;
      e = 0;
    }
    return { ...a, seong, exp: e };
  });
  return applyPrereqTrickle(martialArts, mainId, exp, d.realm);
}
function applyPrereqTrickle(arts, sourceArtId, exp, realm) {
  if (exp <= 0) return arts;
  const source = findMartialArt(sourceArtId);
  const prereqs = source?.prerequisites ?? [];
  if (prereqs.length === 0) return arts;
  const learned = prereqs.filter((p) => arts.some((a) => a.artId === p.artId));
  if (learned.length === 0) return arts;
  const sharePerBook = exp * TRICKLE_RATE / learned.length;
  return arts.map((inst) => {
    const hit = learned.find((p) => p.artId === inst.artId);
    if (!hit) return inst;
    const art = findMartialArt(inst.artId);
    if (!art) return inst;
    const cap = Math.min(seongCap(art.grade), REALM_SEONG_CAP[realm]);
    if (inst.seong >= cap) return inst;
    let seong = inst.seong;
    let e = inst.exp + sharePerBook * GRADE_LEARN_MULT[art.grade];
    while (seong < cap && e >= expToNextSeong(seong)) {
      e -= expToNextSeong(seong);
      seong += 1;
    }
    if (seong >= cap) {
      seong = cap;
      e = 0;
    }
    return { ...inst, seong, exp: e };
  });
}

// src/data/tallyKeys.ts
var TALLY = {
  // 총량
  questAttempt: "quest.attempt",
  //  결산된 의뢰 총수(실패·재난 포함)
  questDone: "quest.done",
  //        성공(완수·성공·위기끝성공)
  questFull: "quest.full",
  //        흠 없는 완수(full)
  questFail: "quest.fail",
  //        실패+재난
  // 등급별 성공
  gradeMenial: "quest.grade.menial",
  gradeMinor: "quest.grade.minor",
  gradeNormal: "quest.grade.normal",
  gradeDangerous: "quest.grade.dangerous",
  gradeExtreme: "quest.grade.extreme",
  // 도메인별 성공
  domGuard: "quest.dom.guard",
  domScout: "quest.dom.scout",
  domDuel: "quest.dom.duel",
  domMedicine: "quest.dom.medicine",
  domAssassin: "quest.dom.assassin",
  domGrand: "quest.dom.grand",
  // 특수 결
  gray: "quest.gray",
  //             회색(청부) 성공
  sponsored: "quest.sponsored",
  //   우호 문파 후원 의뢰 성공
  worldEvent: "quest.world",
  //      강호 사건 의뢰 성공
  solo: "quest.solo",
  //             1인 단신 성공
  party: "quest.party",
  //           3인+ 합공 성공
  noble: "quest.noble",
  //           귀인(noble) 구출
  // 위험·생사
  disasterSurvived: "quest.disasterSurvived",
  // 치명상 생환(사지에서 돌아옴)
  death: "quest.death",
  //           의뢰 중 동문 사망
  // 노획
  scrollFound: "quest.scroll",
  //    의뢰로 비급 입수
  divineElixir: "quest.divineElixir"
  // 극험에서 신품 영약 천운
};
var STREAK = {
  flawless: "quest.streak.flawless"
  // 연속 완벽 완수
};
var GRADE_TALLY = {
  menial: TALLY.gradeMenial,
  minor: TALLY.gradeMinor,
  normal: TALLY.gradeNormal,
  dangerous: TALLY.gradeDangerous,
  extreme: TALLY.gradeExtreme
};
var DOMAIN_TALLY = {
  guard: TALLY.domGuard,
  scout: TALLY.domScout,
  duel: TALLY.domDuel,
  medicine: TALLY.domMedicine,
  assassin: TALLY.domAssassin,
  grand: TALLY.domGrand
};

// src/stores/tallyStore.ts
init_esm();
init_middleware();
init_persistStorage();
var useTallyStore = create()(
  persist(
    (set, get) => ({
      counts: {},
      streaks: {},
      maxStreaks: {},
      n: (key) => get().counts[key] ?? 0,
      streak: (key) => get().maxStreaks[key] ?? 0,
      bump: (key, by = 1) => set((s) => ({ counts: { ...s.counts, [key]: (s.counts[key] ?? 0) + by } })),
      bumpStreak: (key) => set((s) => {
        const cur = (s.streaks[key] ?? 0) + 1;
        const max = Math.max(cur, s.maxStreaks[key] ?? 0);
        return { streaks: { ...s.streaks, [key]: cur }, maxStreaks: { ...s.maxStreaks, [key]: max } };
      }),
      resetStreak: (key) => set((s) => ({ streaks: { ...s.streaks, [key]: 0 } })),
      reset: () => set({ counts: {}, streaks: {}, maxStreaks: {} })
    }),
    {
      name: "tally",
      storage: createJSONStorage(() => metaStorage),
      version: 1,
      partialize: (s) => ({ counts: s.counts, streaks: s.streaks, maxStreaks: s.maxStreaks })
    }
  )
);

// src/systems/questTally.ts
var WORLD_QUEST_PREFIX = "world-evt-";
function recordQuestResult(r) {
  const t = useTallyStore.getState();
  t.bump(TALLY.questAttempt);
  const success = r.outcome === "full" || r.outcome === "partial" || r.outcome === "crisis";
  if (r.outcome === "fail" || r.outcome === "disaster") t.bump(TALLY.questFail);
  if (r.outcome === "full") {
    t.bump(TALLY.questFull);
    t.bumpStreak(STREAK.flawless);
  } else {
    t.resetStreak(STREAK.flawless);
  }
  if (success) {
    t.bump(TALLY.questDone);
    t.bump(GRADE_TALLY[r.quest.grade]);
    t.bump(DOMAIN_TALLY[r.quest.domain]);
    if (r.quest.gray) t.bump(TALLY.gray);
    if (r.quest.faction) t.bump(TALLY.sponsored);
    if (r.quest.id.startsWith(WORLD_QUEST_PREFIX)) t.bump(TALLY.worldEvent);
    if (r.partySize <= 1) t.bump(TALLY.solo);
    if (r.partySize >= 3) t.bump(TALLY.party);
    if (r.noble) t.bump(TALLY.noble);
  }
  if (r.fatalSurvived) t.bump(TALLY.disasterSurvived);
  if (r.death) t.bump(TALLY.death);
  if (r.scrollFound) t.bump(TALLY.scrollFound);
  if (r.divineElixir) t.bump(TALLY.divineElixir);
}

// src/systems/researchSystem.ts
init_martialArts();
init_codexStore();
init_gameStore();

// src/stores/masterStore.ts
init_esm();
init_middleware();
init_persistStorage();
var useMasterStore = create()(
  persist(
    (set) => ({
      master: null,
      setMaster: (master) => set({ master }),
      update: (patch) => set((s) => s.master ? { master: { ...s.master, ...patch } } : s),
      adjustReputation: (axis, delta) => set((s) => {
        if (!s.master) return s;
        const value = Math.max(0, Math.min(100, s.master.reputation[axis] + delta));
        return {
          master: {
            ...s.master,
            reputation: { ...s.master.reputation, [axis]: value }
          }
        };
      }),
      adjustHealth: (delta) => set((s) => {
        if (!s.master) return s;
        const value = Math.max(0, Math.min(100, s.master.health + delta));
        return { master: { ...s.master, health: value } };
      }),
      adjustQi: (delta) => set((s) => {
        if (!s.master) return s;
        const value = Math.max(0, Math.min(100, s.master.qi + delta));
        return { master: { ...s.master, qi: value } };
      }),
      reset: () => set({ master: null })
    }),
    {
      name: "master",
      storage: createJSONStorage(() => slotAwareStorage)
    }
  )
);

// src/systems/researchSystem.ts
var MIN = 6e4;
var HOUR = 60 * MIN;
var RESEARCH_DURATION_MS = {
  novice: 10 * MIN,
  apprentice: 60 * MIN,
  master: 4 * HOUR,
  grandmaster: 12 * HOUR,
  legendary: 24 * HOUR
};
var researchInstant = false;
function isResearchInstant() {
  return researchInstant;
}

// src/systems/combat/engine.ts
init_realm();
init_martialArts();

// src/systems/combat/sheet.ts
init_realm();

// src/systems/combatPower.ts
init_martialArts();
init_realm();
var REALM_WEIGHT = {
  none: 0.4,
  samryu: 1,
  iryu: 1.5,
  ilryu: 2.2,
  jeoljeong: 3.2,
  chojeoljeong: 4.5,
  hwagyeong: 6.5
};
var GRADE_COEF = {
  novice: 1,
  apprentice: 1.4,
  master: 2,
  grandmaster: 2.8,
  legendary: 3.6
};
var RANK_WEIGHT = [1, 0.6, 0.4, 0.3, 0.2, 0.15, 0.1, 0.07];
function pathsOppose(a, b) {
  return a === "jeong" && (b === "sa" || b === "ma") || (a === "sa" || a === "ma") && b === "jeong";
}
function kitConflictPenalty(arts) {
  const paths = arts.map((a) => a.path);
  const hasJeong = paths.includes("jeong");
  const dark = paths.filter((p) => p === "sa" || p === "ma").length;
  if (!hasJeong || dark === 0) return 0;
  void pathsOppose;
  return Math.min(0.2, 0.08 + dark * 0.04);
}
function kitPower(arts, realm) {
  const contribs = arts.map((a) => GRADE_COEF[a.grade] * Math.max(0, a.seong - 1)).filter((c) => c > 0).sort((a, b) => b - a);
  let sum = 0;
  for (let i = 0; i < contribs.length; i += 1) {
    sum += contribs[i] * (RANK_WEIGHT[i] ?? 0.05);
  }
  const realmW = REALM_WEIGHT[realm] ?? 1;
  const power = realmW * sum * (1 - kitConflictPenalty(arts));
  return Math.round(power * 10);
}
function combatRating(d) {
  const mainId = d.mainMartialArtId ?? d.martialArts[0]?.artId;
  const mainInst = mainId ? d.martialArts.find((a) => a.artId === mainId) : void 0;
  const base = (mainInst?.seong ?? 0) * 10;
  const others = d.martialArts.filter((a) => a.artId !== mainInst?.artId).map((a) => Math.max(0, a.seong - 1)).sort((x, y) => y - x);
  const w = [0.5, 0.3, 0.2, 0.1];
  let breadth = 0;
  for (let i = 0; i < others.length; i += 1) breadth += others[i] * (w[i] ?? 0.05);
  breadth = Math.min(15, breadth);
  const realmBonus = Math.min(8, Math.max(0, REALM_ORDER.indexOf(d.realm) - 2) * 2);
  return Math.round(base + breadth + realmBonus);
}

// src/systems/combat/sheet.ts
init_martialArts();
function traitsOf(a) {
  return a.traits ?? defaultArtTraits(a);
}
function bestDepth(arts, school) {
  let best = 0;
  for (const a of arts) {
    if (a.school !== school) continue;
    best = Math.max(best, Math.max(0, a.seong - 1) * GRADE_COEF[a.grade]);
  }
  return best;
}
function mainArt(c) {
  return c.arts.find((a) => a.isMain) ?? c.arts[0];
}
var GRADE_RANK = {
  novice: 0,
  apprentice: 1,
  master: 2,
  grandmaster: 3,
  legendary: 4
};
function woundDepth(severity) {
  if (severity == null) return 0;
  return Math.max(0, Math.min(1, (5 - severity) / 4));
}
function qiEdge(myInternal, foeMeanInternal) {
  const edge = 1 + (myInternal - foeMeanInternal) / 1300 * 0.12;
  return Math.max(0.88, Math.min(1.12, edge));
}
function buildSheet(c, foeMeanInternal) {
  const power = Math.max(
    kitPower(c.arts, c.realm),
    4 + c.strength * 0.12 + c.agility * 0.06
  );
  const extDepth = bestDepth(c.arts, "external");
  const lightDepth = bestDepth(c.arts, "lightness");
  const qigongDepth = bestDepth(c.arts, "qigong");
  const hiddenDepth = bestDepth(c.arts, "hidden");
  const realmIdx2 = Math.max(0, REALM_ORDER.indexOf(c.realm));
  const staminaMult = 0.7 + 0.3 * Math.max(0, Math.min(1, c.staminaFrac));
  const woundMult = c.woundSeverity != null ? 0.55 + 0.09 * c.woundSeverity : 1;
  const wd = woundDepth(c.woundSeverity);
  const immuneTo = (t) => t != null && c.woundType === t && resistsWound(c.woundResist?.[t], c.woundSeverity ?? 5);
  const frostSlow = c.woundType === "frost" && !immuneTo("frost") ? 1 - 0.25 * wd : 1;
  const innerDrainMult = c.woundType === "inner" ? 1 + 0.6 * wd : 1;
  const dotFrac = c.woundType === "poison" && !immuneTo("poison") ? 0.015 * wd : c.woundType === "burn" && !immuneTo("burn") ? 0.01 * wd : 0;
  const main = mainArt(c);
  const isMa = main?.path === "ma";
  const mainTraits = main ? traitsOf(main) : [];
  const hasTrait = (t) => mainTraits.includes(t);
  const swift = hasTrait("swift");
  const guard = c.arts.some((a) => traitsOf(a).includes("guard"));
  const mainGradeMult = 1 + (main ? GRADE_RANK[main.grade] * 0.035 : 0);
  const atk = power * (0.85 + c.strength * 3e-3) * mainGradeMult * qiEdge(c.internal, foeMeanInternal) * staminaMult * woundMult;
  const def = power * (0.5 + c.strength * 4e-3 + extDepth * 0.03 + qigongDepth * 0.01);
  const spd = (c.agility + lightDepth * 3.5 + realmIdx2 * 8) * (swift ? 1.12 : 1) * frostSlow;
  const maxHp = 70 + c.endurance;
  const qiDrain = Math.max(2, 7 + (main ? GRADE_RANK[main.grade] * 1.5 : 0) - Math.min(6, qigongDepth * 0.8)) * innerDrainMult;
  const critChance = 0.04 + hiddenDepth * 0.01 + (isMa ? 0.03 : 0) + (c.prudence < 35 ? 0.02 : 0);
  return {
    ref: c,
    power,
    atk,
    def,
    spd,
    maxHp,
    qiDrain,
    critChance,
    isMa,
    hiddenDepth,
    qigongOrMaMain: isMa || main?.school === "qigong",
    sweep: hasTrait("sweep"),
    wild: hasTrait("wild"),
    drain: hasTrait("drain"),
    poison: hasTrait("poison"),
    burn: hasTrait("burn"),
    frost: hasTrait("frost"),
    pierce: hasTrait("pierce"),
    guard,
    dotFrac
  };
}

// src/systems/combat/engine.ts
var clamp3 = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
var safeClamp = (n, lo, hi) => Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : lo;
var MAX_ROUNDS_DEFAULT = 30;
var BASE_HIT = 0.74;
var HIT_SPD_SCALE = 260;
var BASE_DMG_FRAC = 0.085;
var DMG_RATIO_EXP = 0.75;
var CRIT_MULT = 1.8;
var SPAR_YIELD_HP = 0.38;
var SPAR_YIELD_QI = 8;
var QI_LOW = 35;
var QI_EMPTY = 12;
var GANG_SPD_PENALTY = 0.12;
var GANG_IMMUNE_REALM_GAP = 2;
var ENGAGE_CAP = 2;
var MOOK_DMG_FLOOR = 4e-3;
var DMG_FLOOR = 0.015;
var CLEAVE_BASE = 2;
var CLEAVE_DMG_MULT = 0.9;
var FRIENDLY_FIRE_MULT = 0.5;
var SWEEP_BASE = 1;
var DRAIN_QI = 10;
var PIERCE_DEF_IGNORE = 0.3;
var ACCIDENT_BASE = 0.02;
var ACCIDENT_CRUSH = 0.05;
var RETREAT_HP = 0.3;
var ROUT_CASUALTY_FRAC = 0.3;
var ROUT_CASUALTY_GAP = 0.25;
var BURST_SIMMA = 60;
function aliveOf(fs, side) {
  return fs.filter((f) => f.side === side && f.state === "standing");
}
function qiMult(f) {
  if (f.qi <= QI_EMPTY) return 0.55;
  if (f.qi <= QI_LOW) return 0.8;
  return 1;
}
function effAtk(f) {
  return f.sheet.atk * qiMult(f) * (f.burst ? 1.15 : 1);
}
function effDef(f) {
  return f.sheet.def * (f.burst ? 0.85 : 1);
}
function woundTypeOf(finisher, defender, severity, rng) {
  const wr = defender.sheet.ref.woundResist;
  const resisted = (t2) => resistsWound(wr?.[t2], severity);
  let t = finisher.sheet.burn ? "burn" : finisher.sheet.frost ? "frost" : finisher.sheet.poison || finisher.sheet.hiddenDepth > 0 && rng() < 0.5 ? "poison" : finisher.sheet.qigongOrMaMain ? "inner" : "wound";
  if ((t === "burn" || t === "frost" || t === "poison") && resisted(t)) t = "wound";
  if (t === "wound" && resisted("wound")) t = "inner";
  return t;
}
function realmIdx(f) {
  return Math.max(0, REALM_ORDER.indexOf(f.sheet.ref.realm));
}
function sideStrength(fs, side) {
  const members = fs.filter((f) => f.side === side);
  if (members.length === 0) return 0;
  const sum = members.reduce(
    (acc, f) => acc + (f.state === "standing" ? safeClamp(Math.max(0, f.hp) / f.sheet.maxHp, 0, 1) : 0),
    0
  );
  return sum / members.length;
}
function sideResidual(fs, side) {
  const members = fs.filter((f) => f.side === side);
  if (members.length === 0) return 0;
  const sum = members.reduce((acc, f) => {
    if (f.state === "dead" || f.state === "fled") return acc;
    return acc + safeClamp(Math.max(0, f.hp) / f.sheet.maxHp, 0, 1);
  }, 0);
  return sum / members.length;
}
function simulateCombat(sideA, sideB, config) {
  const rng = config.rng ?? random;
  const maxRounds = config.maxRounds ?? MAX_ROUNDS_DEFAULT;
  const lethal = config.lethal ?? true;
  const allowRetreat = config.allowRetreat ?? true;
  const real = config.mode === "real";
  const meanInternal = (cs) => cs.length === 0 ? 0 : cs.reduce((a, c) => a + c.internal, 0) / cs.length;
  const fighters = [
    ...sideA.map((c) => ({ c, side: "A", foe: meanInternal(sideB) })),
    ...sideB.map((c) => ({ c, side: "B", foe: meanInternal(sideA) }))
  ].map(({ c, side, foe }) => {
    const sheet = buildSheet(c, foe);
    return {
      sheet,
      side,
      hp: sheet.maxHp,
      qi: 100 * (0.6 + 0.4 * clamp3(c.staminaFrac, 0, 1)),
      state: "standing",
      dealt: 0,
      taken: 0,
      burst: real && c.simma >= BURST_SIMMA,
      drained: 0
    };
  });
  const events = [];
  for (const f of fighters) {
    if (f.burst) events.push({ round: 0, kind: "burst", actorId: f.sheet.ref.id });
  }
  const initCount = { A: Math.max(1, sideA.length), B: Math.max(1, sideB.length) };
  const applyStrike = (attacker, defender, frac, crit, rnd) => {
    if (defender.state !== "standing") return;
    defender.hp -= frac * defender.sheet.maxHp;
    attacker.dealt += frac;
    defender.taken += frac;
    events.push({
      round: rnd,
      kind: crit ? "crit" : "exchange",
      actorId: attacker.sheet.ref.id,
      targetId: defender.sheet.ref.id,
      dmgFrac: frac
    });
    if (!real) {
      if (defender.hp / defender.sheet.maxHp <= SPAR_YIELD_HP || defender.qi <= SPAR_YIELD_QI) {
        defender.state = "yielded";
        events.push({ round: rnd, kind: "yield", actorId: defender.sheet.ref.id });
      }
      return;
    }
    if (defender.hp > 0) return;
    defender.state = "downed";
    const overkill = Math.min(1, -defender.hp / defender.sheet.maxHp);
    const mercyMult = attacker.sheet.ref.mercy < 40 ? 1.3 : attacker.sheet.ref.mercy > 65 ? 0.45 : 1;
    const deathChance = lethal ? clamp3(
      (0.12 + overkill * 0.5) * mercyMult * (attacker.sheet.isMa ? 1.5 : 1) * (1 - defender.sheet.ref.strength / 220),
      0,
      0.6
    ) : 0;
    if (rng() < deathChance) {
      defender.state = "dead";
      events.push({ round: rnd, kind: "death", actorId: attacker.sheet.ref.id, targetId: defender.sheet.ref.id });
    } else {
      const severity = overkill > 0.3 ? 1 : 2;
      defender.wound = { type: woundTypeOf(attacker, defender, severity, rng), severity, days: severity === 1 ? 30 : 21 };
      events.push({ round: rnd, kind: "down", actorId: attacker.sheet.ref.id, targetId: defender.sheet.ref.id });
    }
  };
  let round = 0;
  while (round < maxRounds && aliveOf(fighters, "A").length > 0 && aliveOf(fighters, "B").length > 0) {
    round += 1;
    for (const f of fighters) {
      if (f.state !== "standing" || f.sheet.dotFrac <= 0) continue;
      f.hp -= f.sheet.dotFrac * f.sheet.maxHp;
      if (real) {
        if (f.hp <= 0) {
          f.state = "downed";
          events.push({ round, kind: "down", targetId: f.sheet.ref.id });
        }
      } else if (f.hp / f.sheet.maxHp <= SPAR_YIELD_HP) {
        f.state = "yielded";
        events.push({ round, kind: "yield", actorId: f.sheet.ref.id });
      }
    }
    if (aliveOf(fighters, "A").length === 0 || aliveOf(fighters, "B").length === 0) break;
    if (real && allowRetreat && round >= 3) {
      for (const side of ["A", "B"]) {
        const mine = aliveOf(fighters, side);
        const foes = aliveOf(fighters, side === "A" ? "B" : "A");
        if (mine.length === 0 || foes.length === 0) continue;
        const myPow = mine.reduce((a, f) => a + f.sheet.power, 0);
        const foePow = foes.reduce((a, f) => a + f.sheet.power, 0);
        const myCas = 1 - mine.length / initCount[side];
        const foeCas = 1 - foes.length / initCount[side === "A" ? "B" : "A"];
        const overpowered = sideStrength(fighters, side) < RETREAT_HP && myPow < foePow * 0.6;
        const slaughtered = myCas >= ROUT_CASUALTY_FRAC && foeCas <= myCas - ROUT_CASUALTY_GAP;
        if (overpowered || slaughtered) {
          const fastestFoe = Math.max(...foes.map((f) => f.sheet.spd));
          for (const f of mine) {
            const p = clamp3(0.3 + (f.sheet.spd - fastestFoe) / 200, 0.1, 0.9);
            if (rng() < p) {
              f.state = "fled";
              events.push({ round, kind: "flee", actorId: f.sheet.ref.id });
            }
          }
        }
      }
      if (aliveOf(fighters, "A").length === 0 || aliveOf(fighters, "B").length === 0) break;
    }
    const order = fighters.filter((f) => f.state === "standing").sort((x, y) => y.sheet.spd * (0.9 + rng() * 0.2) - x.sheet.spd * (0.9 + rng() * 0.2));
    const focusCount = {};
    for (const actor of order) {
      if (actor.state !== "standing") continue;
      const allFoes = aliveOf(fighters, actor.side === "A" ? "B" : "A");
      if (allFoes.length === 0) break;
      const foes = allFoes.filter((f) => (focusCount[f.sheet.ref.id] ?? 0) < ENGAGE_CAP);
      if (foes.length === 0) continue;
      const weights = foes.map((f) => 1.5 - f.hp / f.sheet.maxHp);
      const total = weights.reduce((a, w) => a + w, 0);
      let pick = rng() * total;
      let target = foes[foes.length - 1];
      for (let i = 0; i < foes.length; i += 1) {
        pick -= weights[i];
        if (pick <= 0) {
          target = foes[i];
          break;
        }
      }
      const extras = focusCount[target.sheet.ref.id] ?? 0;
      const gap = realmIdx(actor) - realmIdx(target);
      const gangImmune = -gap >= GANG_IMMUNE_REALM_GAP;
      const targetSpd = target.sheet.spd * (gangImmune ? 1 : Math.max(0.4, 1 - GANG_SPD_PENALTY * extras));
      focusCount[target.sheet.ref.id] = extras + 1;
      actor.qi = Math.max(0, actor.qi - actor.sheet.qiDrain);
      const pHit = clamp3(
        BASE_HIT + (actor.sheet.spd - targetSpd) / HIT_SPD_SCALE + actor.sheet.ref.insight * 0.012 - target.sheet.ref.insight * 0.01,
        0.3,
        0.96
      );
      if (rng() >= pHit) {
        events.push({ round, kind: "miss", actorId: actor.sheet.ref.id, targetId: target.sheet.ref.id });
        continue;
      }
      const defVal = Math.max(1, effDef(target) * (actor.sheet.pierce ? 1 - PIERCE_DEF_IGNORE : 1));
      const ratio = effAtk(actor) / defVal;
      const crit = rng() < actor.sheet.critChance;
      let frac = BASE_DMG_FRAC * Math.pow(ratio, DMG_RATIO_EXP) * (0.85 + rng() * 0.3);
      if (crit) frac *= CRIT_MULT;
      frac = clamp3(frac, gap <= -GANG_IMMUNE_REALM_GAP ? MOOK_DMG_FLOOR : DMG_FLOOR, 0.5);
      applyStrike(actor, target, frac, crit, round);
      if (actor.sheet.drain) {
        const steal = Math.min(target.qi, DRAIN_QI);
        target.qi -= steal;
        actor.qi = Math.min(100, actor.qi + steal);
        actor.drained += steal;
      }
      let sweep = actor.sheet.sweep ? SWEEP_BASE : 0;
      if (gap >= GANG_IMMUNE_REALM_GAP) {
        const gapBonus = CLEAVE_BASE + (gap - GANG_IMMUNE_REALM_GAP);
        sweep += actor.sheet.sweep ? gapBonus : Math.ceil(gapBonus * 0.6);
      }
      if (sweep > 0) {
        const others = aliveOf(fighters, actor.side === "A" ? "B" : "A").filter((f) => f !== target).sort((x, y) => x.hp / x.sheet.maxHp - y.hp / y.sheet.maxHp).slice(0, sweep);
        for (const o of others) applyStrike(actor, o, frac * CLEAVE_DMG_MULT, false, round);
        if (actor.sheet.wild) {
          const allies = aliveOf(fighters, actor.side).filter((f) => f !== actor).sort((x, y) => x.hp / x.sheet.maxHp - y.hp / y.sheet.maxHp).slice(0, sweep);
          for (const a of allies) applyStrike(actor, a, frac * CLEAVE_DMG_MULT * FRIENDLY_FIRE_MULT, false, round);
        }
      }
      if (!real && actor.state === "standing" && actor.qi <= SPAR_YIELD_QI) {
        actor.state = "yielded";
        events.push({ round, kind: "yield", actorId: actor.sheet.ref.id });
      }
    }
  }
  const standA = aliveOf(fighters, "A").length;
  const standB = aliveOf(fighters, "B").length;
  const rA = sideResidual(fighters, "A");
  const rB = sideResidual(fighters, "B");
  const winner = standA > 0 && standB === 0 ? "A" : standB > 0 && standA === 0 ? "B" : Math.abs(rA - rB) < 0.05 ? "draw" : rA > rB ? "A" : "B";
  const margin = safeClamp(Math.abs(rA - rB), 0, 1);
  const tier = margin < 0.22 ? "close" : margin < 0.5 ? "edge" : "crush";
  let accident;
  if (!real) {
    const powA = Math.max(...fighters.filter((f) => f.side === "A").map((f) => f.sheet.power));
    const powB = Math.max(...fighters.filter((f) => f.side === "B").map((f) => f.sheet.power));
    const ratio = Math.max(powA, powB) / Math.max(1, Math.min(powA, powB));
    const p = ACCIDENT_BASE + (ratio >= 2.2 ? ACCIDENT_CRUSH : 0) + (config.extraAccidentChance ?? 0);
    if (rng() < p) {
      const weakSide = powA <= powB ? "A" : "B";
      const pool = fighters.filter((f) => f.side === weakSide);
      const victim = pool[Math.floor(rng() * pool.length)];
      const strikers = fighters.filter((f) => f.side !== weakSide);
      const striker = strikers[Math.floor(rng() * strikers.length)];
      victim.wound = { type: "wound", severity: 4, days: 10 };
      accident = { victimId: victim.sheet.ref.id, strikerId: striker.sheet.ref.id };
      events.push({
        round,
        kind: "accident",
        actorId: striker.sheet.ref.id,
        targetId: victim.sheet.ref.id
      });
    }
  }
  if (real) {
    for (const f of fighters) {
      if (f.state !== "standing" || f.wound) continue;
      const frac = Math.max(0, f.hp) / f.sheet.maxHp;
      if (frac < 0.35) f.wound = { type: "wound", severity: 3, days: 12 };
      else if (frac < 0.55) f.wound = { type: "wound", severity: 4, days: 7 };
    }
  }
  let mvpId;
  let bestDealt = -1;
  const combatants = fighters.map((f) => {
    if (f.dealt > bestDealt) {
      bestDealt = f.dealt;
      mvpId = f.sheet.ref.id;
    }
    return {
      id: f.sheet.ref.id,
      name: f.sheet.ref.name,
      side: f.side,
      state: f.state,
      hpFrac: safeClamp(f.hp / f.sheet.maxHp, 0, 1),
      qiFrac: safeClamp(f.qi / 100, 0, 1),
      dealtFrac: Math.round(safeClamp(f.dealt, 0, Number.MAX_SAFE_INTEGER) * 100) / 100,
      takenFrac: Math.round(safeClamp(f.taken, 0, Number.MAX_SAFE_INTEGER) * 100) / 100,
      drainedQi: f.drained > 0 ? Math.round(f.drained) : void 0,
      wound: f.wound
    };
  });
  return { mode: config.mode, rounds: round, winner, margin, tier, combatants, mvpId, events, accident };
}

// src/systems/combat/fromDisciple.ts
init_martialArts();

// src/data/elixirs.ts
var DIVINE_ELIXIR_ID = "guzeon-daehwandan";
function divineElixirItem() {
  return {
    id: DIVINE_ELIXIR_ID,
    category: "elixir",
    name: "\uAD6C\uC804\uB300\uD658\uB2E8",
    grade: 5,
    // 신품
    count: 1,
    effects: "\uD654\uACBD\uC758 \uBCBD\uC744 \uB118\uAC8C \uD558\uB294 \uC2E0\uD488 \uC601\uC57D. \uAE68\uB2EC\uC74C\uC758 \uB9C8\uC9C0\uB9C9 \uC5F4\uC1E0 \u2014 \uD3D0\uAD00 \uC911 \uBCF5\uC6A9\uD558\uBA74 \uD654\uACBD\uC5D0 \uB4E0\uB2E4."
  };
}
var DIVINE_ELIXIR_DROP_RATE = 0.08;

// src/systems/woundSystem.ts
init_martialArts();

// src/data/efficiency.ts
var BODY_EFFICIENCY_MULTIPLIER = {
  \uD2B9\uD654: 1,
  \uC0C1\uC131: 0.8,
  \uBCF4\uD1B5: 0.62,
  \uBBF8\uC219: 0.35,
  \uC0C1\uADF9: 0.18
};

// src/stores/alchemyStore.ts
init_esm();
init_middleware();
init_persistStorage();
var useAlchemyStore = create()(
  persist(
    (set) => ({
      learnedRecipes: [],
      activeCrafts: {},
      firstCrafted: [],
      labOperational: true,
      learn: (id) => set((s) => s.learnedRecipes.includes(id) ? s : { learnedRecipes: [...s.learnedRecipes, id] }),
      setCraft: (discipleId, job) => set((s) => ({ activeCrafts: { ...s.activeCrafts, [discipleId]: job } })),
      clearCraft: (discipleId) => set((s) => {
        const { [discipleId]: _removed, ...rest } = s.activeCrafts;
        return { activeCrafts: rest };
      }),
      markFirst: (key) => set((s) => s.firstCrafted.includes(key) ? s : { firstCrafted: [...s.firstCrafted, key] }),
      setLabOp: (on) => set({ labOperational: on }),
      hydrate: (state) => set({
        learnedRecipes: state.learnedRecipes ?? [],
        activeCrafts: state.activeCrafts ?? {},
        firstCrafted: state.firstCrafted ?? [],
        labOperational: state.labOperational ?? true
      }),
      reset: () => set({ learnedRecipes: [], activeCrafts: {}, firstCrafted: [], labOperational: true })
    }),
    {
      name: "alchemy",
      storage: createJSONStorage(() => slotAwareStorage)
    }
  )
);

// src/stores/itemStore.ts
init_esm();
init_middleware();
init_persistStorage();
var useItemStore = create()(
  persist(
    (set, get) => ({
      items: [],
      setAll: (list) => set({ items: list }),
      add: (item) => set((s) => {
        const existing = s.items.find((i) => i.id === item.id);
        if (existing) {
          return {
            items: s.items.map(
              (i) => i.id === item.id ? { ...i, count: i.count + item.count } : i
            )
          };
        }
        return { items: [...s.items, item] };
      }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      adjustCount: (id, delta) => set((s) => ({
        items: s.items.map((i) => i.id === id ? { ...i, count: i.count + delta } : i).filter((i) => i.count > 0)
      })),
      byCategory: (cat) => get().items.filter((i) => i.category === cat),
      countOf: (cat) => get().items.filter((i) => i.category === cat).reduce((sum, i) => sum + i.count, 0),
      reset: () => set({ items: [] })
    }),
    {
      name: "items",
      storage: createJSONStorage(() => slotAwareStorage)
    }
  )
);

// src/systems/alchemySystem.ts
function consumeElixirItem(id, n = 1) {
  if (!Number.isFinite(n) || n <= 0) return false;
  const items = useItemStore.getState();
  if ((items.items.find((i) => i.id === id)?.count ?? 0) < n) return false;
  items.adjustCount(id, -n);
  return true;
}

// src/systems/woundSystem.ts
function worstWound(d) {
  const ws = d.wounds;
  if (!ws || ws.length === 0) return void 0;
  return ws.reduce(
    (a, b) => b.severity < a.severity || b.severity === a.severity && b.daysRemaining > a.daysRemaining ? b : a
  );
}
function applyWoundSet(discipleId, wounds) {
  const ds = useDiscipleStore.getState();
  if (wounds.length === 0) {
    ds.update(discipleId, { status: "training", wounds: void 0 });
  } else {
    ds.update(discipleId, { status: "injured", wounds });
  }
}
function inflictWound(discipleId, type, severity, days) {
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[discipleId];
  if (!d) return;
  if (resistsWound(woundResistOf(d.martialArts)[type], severity)) return;
  const wounds = [...d.wounds ?? []];
  const idx = wounds.findIndex((w) => w.type === type);
  if (idx >= 0) {
    const prev = wounds[idx];
    wounds[idx] = {
      type,
      severity: Math.min(prev.severity, severity),
      daysRemaining: Math.max(prev.daysRemaining, days)
    };
  } else {
    wounds.push({ type, severity, daysRemaining: days });
  }
  applyWoundSet(discipleId, wounds);
}

// src/systems/combat/fromDisciple.ts
function statLevel(d, id) {
  return d.stats?.[id]?.level ?? 0;
}
function combatantFromDisciple(d) {
  const mainId = d.mainMartialArtId ?? d.martialArts[0]?.artId;
  const arts = d.martialArts.map((inst) => {
    const art = findMartialArt(inst.artId);
    if (!art) return null;
    return {
      school: art.school,
      grade: art.grade,
      path: art.path,
      seong: inst.seong,
      isMain: inst.artId === mainId,
      traits: artTraits(art)
    };
  }).filter((a) => a != null);
  return {
    id: d.id,
    name: d.name,
    realm: d.realm,
    arts,
    internal: d.realmProgress?.internal ?? 0,
    strength: statLevel(d, "strength"),
    agility: statLevel(d, "agility"),
    endurance: statLevel(d, "endurance"),
    staminaFrac: d.maxStamina > 0 ? d.stamina / d.maxStamina : 1,
    insight: d.insight ?? 1,
    prudence: d.personality?.prudence ?? 50,
    mercy: d.personality?.mercy ?? 50,
    simma: d.simma ?? 0,
    woundSeverity: worstWound(d)?.severity,
    woundType: worstWound(d)?.type,
    woundResist: woundResistOf(d.martialArts)
  };
}

// src/systems/combat/npc.ts
init_realm2();
init_martialArts();
var ARCHETYPES = {
  bandit: { school: "saber", path: "jung", mercy: 30, prudence: 35 },
  soldier: { school: "saber", path: "jeong", mercy: 55, prudence: 55, sub: "external" },
  orthodox: { school: "sword", path: "jeong", mercy: 70, prudence: 60, sub: "lightness" },
  rogue: { school: "sword", path: "sa", mercy: 35, prudence: 40, sub: "hidden" },
  assassin: { school: "hidden", path: "sa", mercy: 15, prudence: 70, sub: "lightness" },
  cultist: { school: "darkArts", path: "ma", mercy: 20, prudence: 30, sub: "qigong" },
  beast: { school: "external", path: "jung", mercy: 0, prudence: 20 }
};
var REALM_NPC_GRADE = {
  none: "novice",
  samryu: "novice",
  iryu: "apprentice",
  ilryu: "apprentice",
  jeoljeong: "master",
  chojeoljeong: "grandmaster",
  hwagyeong: "grandmaster"
};
function makeNpcCombatant(spec) {
  const rng = spec.rng ?? random;
  const q = Math.max(0, Math.min(1, spec.quality ?? 0.5));
  const a = ARCHETYPES[spec.archetype];
  const cap = Math.max(1, REALM_SEONG_CAP[spec.realm]);
  const mainSeong = Math.max(1, Math.round(cap * (0.55 + 0.45 * q)));
  const mainGrade = REALM_NPC_GRADE[spec.realm];
  const arts = [
    {
      school: a.school,
      grade: mainGrade,
      path: a.path,
      seong: mainSeong,
      isMain: true,
      traits: defaultArtTraits({ school: a.school, grade: mainGrade, path: a.path })
    }
  ];
  if (a.sub) {
    arts.push({
      school: a.sub,
      grade: "novice",
      path: a.path,
      seong: Math.max(1, mainSeong - 1),
      traits: defaultArtTraits({ school: a.sub, grade: "novice", path: a.path })
    });
  }
  const ext = REALM_EXTERNAL_REQ[spec.realm];
  const internal = REALM_INTERNAL_REQ[spec.realm] * (0.85 + 0.3 * q);
  const jitter = () => 0.9 + rng() * 0.2;
  return {
    id: spec.id,
    name: spec.name,
    realm: spec.realm,
    arts,
    internal: Math.round(internal),
    strength: Math.round(Math.min(100, (ext + 8) * (0.8 + 0.4 * q) * jitter())),
    agility: Math.round(Math.min(100, (ext + 4) * (0.75 + 0.5 * q) * jitter())),
    endurance: Math.round(Math.min(100, (ext + 6) * (0.8 + 0.4 * q) * jitter())),
    staminaFrac: 1,
    insight: Math.max(1, Math.min(5, Math.round(1 + q * 3))),
    prudence: a.prudence,
    mercy: a.mercy,
    simma: spec.archetype === "cultist" ? 50 : 0
  };
}

// src/systems/combat/narrate.ts
var WOUND_TYPE_LABEL = {
  wound: "\uC678\uC0C1",
  burn: "\uD654\uC0C1",
  poison: "\uC911\uB3C5",
  frost: "\uB3D9\uC0C1",
  inner: "\uB0B4\uC0C1"
};
function names(list) {
  return list.map((c) => c.name).join("\xB7");
}
function headline(r, win, lose) {
  const w = names(win);
  const l = names(lose);
  if (r.winner === "draw") {
    return r.mode === "spar" ? `${josa(w, "\uACFC", "\uC640")} ${josa(l, "\uC774", "\uAC00")} \uB05D\uB0B4 \uC6B0\uC5F4\uC744 \uAC00\uB9AC\uC9C0 \uBABB\uD588\uB2E4.` : `${josa(w, "\uACFC", "\uC640")} ${josa(l, "\uC774", "\uAC00")} \uC5B4\uC6B0\uB7EC\uC838 \uC2F8\uC6E0\uC73C\uB098 \uC2B9\uBD80\uAC00 \uB098\uC9C0 \uC54A\uC740 \uCC44 \uAC08\uB77C\uC130\uB2E4.`;
  }
  if (r.mode === "spar") {
    if (r.tier === "close") return `${josa(w, "\uC774", "\uAC00")} \uBC18 \uC218 \uCC28\uB85C ${josa(l, "\uC744", "\uB97C")} \uB20C\uB800\uB2E4 \u2014 \uB05D\uAE4C\uC9C0 \uC190\uC5D0 \uB540\uC744 \uC950\uB294 \uD569\uC774\uC5C8\uB2E4.`;
    if (r.tier === "edge") return `${josa(w, "\uC774", "\uAC00")} \uD55C \uC218 \uC704\uC600\uB2E4. ${josa(l, "\uC740", "\uB294")} \uBC1B\uC544\uB0B4\uB294 \uB370 \uAE09\uAE09\uD588\uB2E4.`;
    return `${w}\uC758 \uBB34\uC704\uAC00 \uD55C\uCC38 \uC704\uB77C ${josa(l, "\uC740", "\uB294")} \uC190\uB3C4 \uC81C\uB300\uB85C \uBABB \uC11E\uC5C8\uB2E4.`;
  }
  if (r.tier === "close") return `${josa(w, "\uC774", "\uAC00")} \uC0AC\uB825\uC744 \uB2E4\uD574 ${josa(l, "\uC744", "\uB97C")} \uAEBE\uC5C8\uB2E4 \u2014 \uC885\uC774 \uD55C \uC7A5 \uCC28\uC774\uC600\uB2E4.`;
  if (r.tier === "edge") return `${josa(w, "\uC774", "\uAC00")} ${josa(l, "\uC744", "\uB97C")} \uC81C\uC555\uD588\uB2E4. \uD569\uC774 \uAC08\uC218\uB85D \uACA9\uCC28\uAC00 \uB4DC\uB7EC\uB0AC\uB2E4.`;
  return `${josa(w, "\uC774", "\uAC00")} ${josa(l, "\uC744", "\uB97C")} \uC77C\uBC29\uC801\uC73C\uB85C \uC4F8\uC5B4\uBC84\uB838\uB2E4.`;
}
function aftermath(r) {
  const lines = [];
  for (const c of r.combatants) {
    if (c.state === "dead") lines.push(`${josa(c.name, "\uC740", "\uB294")} \uB05D\uB0B4 \uC77C\uC5B4\uB098\uC9C0 \uBABB\uD588\uB2E4.`);
    else if (c.state === "fled") lines.push(`${josa(c.name, "\uC740", "\uB294")} \uC5B4\uB460\uC744 \uD0C0\uACE0 \uB2EC\uC544\uB0AC\uB2E4.`);
    else if (c.wound)
      lines.push(`${josa(c.name, "\uC774", "\uAC00")} ${WOUND_TYPE_LABEL[c.wound.type]}\uC744(\uB97C) \uC785\uC5C8\uB2E4.`);
    else if (c.state === "standing" && c.qiFrac <= 0.12)
      lines.push(`${josa(c.name, "\uC740", "\uB294")} \uC774\uACBC\uC73C\uB418 \uB0B4\uACF5\uC774 \uBC14\uB2E5\uB098 \uD55C\uB3D9\uC548 \uC6B4\uAE30\uC870\uC2DD\uC774 \uD544\uC694\uD574 \uBCF4\uC600\uB2E4.`);
  }
  return lines;
}
function narrateCombat(r) {
  const sideA = r.combatants.filter((c) => c.side === "A");
  const sideB = r.combatants.filter((c) => c.side === "B");
  const win = r.winner === "B" ? sideB : sideA;
  const lose = r.winner === "B" ? sideA : sideB;
  const lines = [headline(r, win, lose), ...aftermath(r)];
  if (r.rounds >= 20) lines.push("\uC218\uC2ED \uD569\uC744 \uC8FC\uACE0\uBC1B\uC740 \uAE34 \uC2F8\uC6C0\uC774\uC5C8\uB2E4.");
  else if (r.rounds <= 3 && r.tier === "crush") lines.push("\uC2B9\uBD80\uB294 \uC0BD\uC2DC\uAC04\uC5D0 \uAC08\uB838\uB2E4.");
  return lines.join(" ");
}

// src/data/cutscenes/index.ts
var CUTSCENES = [
  // ── 용봉지회 장원 — 강호 후기지수들 정점에 서는 순간 ──────────────────────
  {
    eventId: "tournament_champion",
    hanzi: "\u58EF\u5143",
    title: "\uC6A9\uBD09\uC9C0\uD68C \uC7A5\uC6D0",
    tone: "gold",
    defaultLine: "\uAC15\uD638\uC758 \uD6C4\uAE30\uC9C0\uC218\uB4E4 \uC0AC\uC774\uC5D0\uC11C, {name}\uC774 \uAC00\uC7A5 \uB192\uC740 \uC790\uB9AC\uC5D0 \uC130\uB2E4.",
    byDisciple: {
      "jang-cheol": {
        line: "\uC7A5\uCCA0\uC740 \uC4F0\uB7EC\uC9C4 \uC0C1\uB300\uB97C \uC77C\uC73C\uCF1C \uC138\uC6B4 \uB4A4\uC5D0\uC57C, \uBA4B\uCA4D\uAC8C \uBA38\uB9AC\uB97C \uAE01\uC801\uC600\uB2E4.",
        quote: "\uC6B4\uC774 \uC88B\uC558\uC2B5\uB2C8\uB2E4. \u2026\u2026\uC190\uC740, \uC548 \uB2E4\uCE58\uC168\uC2B5\uB2C8\uAE4C."
      },
      "jin-sohwa": {
        line: "\uC9C4\uC18C\uD654\uB294 \uC774\uAE34 \uC190\uC73C\uB85C \uBA3C\uC800 \uC0C1\uB300\uC758 \uB9E5\uBD80\uD130 \uC9DA\uC5C8\uB2E4. \uB2E8\uC0C1\uC758 \uD658\uD638\uAC00 \uBA38\uC4F1\uD574\uC84C\uB2E4.",
        quote: "\uB9CE\uC774 \uB2E4\uCE58\uC9C4 \uC54A\uC73C\uC168\uC8E0? \uAE08\uCC3D\uC57D, \uC5EC\uAE30 \uC788\uC5B4\uC694."
      },
      "han-baram": {
        line: "\uD55C\uBC14\uB78C\uC740 \uB2E8\uC0C1 \uB09C\uAC04 \uC704\uC5D0 \uD6CC\uCA4D \uC62C\uB77C\uC549\uC544, \uC0B0\uBB38 \uCABD \uD558\uB298\uC744 \uBCF4\uBA70 \uC6C3\uC5C8\uB2E4.",
        quote: "\uBD24\uC9C0? \uC0B0\uBB38 \uC55E\uC5D0 \uC8FC\uC800\uC549\uC544 \uC788\uB358 \uADF8 \uC560 \uB9DE\uC544."
      },
      "yun-soso": {
        line: "\uC724\uC18C\uC18C\uB294 \uAC80\uC744 \uAC70\uB450\uACE0, \uC0AC\uBC29\uC758 \uAD70\uC6C5\uC5D0\uAC8C \uBC18\uB4EF\uD558\uAC8C \uC608\uB97C \uC62C\uB838\uB2E4.",
        quote: "\uC0AC\uBB38\uC758 \uAC80\uC774 \uADF8\uB974\uC9C0 \uC54A\uC558\uC74C\uC744 \uBCF4\uC600\uC744 \uBFD0\uC785\uB2C8\uB2E4."
      },
      "i-cheongha": {
        line: "\uC774\uCCAD\uD558\uB294 \uC3DF\uC544\uC9C0\uB294 \uD658\uD638 \uC18D\uC5D0\uC11C\uB3C4 \uBC84\uB987\uCC98\uB7FC \uCD9C\uAD6C\uBD80\uD130 \uB208\uC73C\uB85C \uC7C0\uB2E4. \uADF8\uB7EC\uB2E4, \uCC98\uC74C\uC73C\uB85C \uBA48\uCDC4\uB2E4.",
        quote: "\u2026\u2026\uC774\uB807\uAC8C \uB9CE\uC740 \uB208\uC55E\uC5D0\uC11C \uC774\uAE34 \uAC74, \uCC98\uC74C\uC774\uC57C."
      },
      "baek-yeon": {
        line: "\uBC31\uC5F0\uC740 \uD638\uD761\uC744 \uAE38\uAC8C \uACE0\uB974\uACE0, \uC18C\uB9AC \uC5C6\uC774 \uB2E8\uC744 \uB0B4\uB824\uC654\uB2E4.",
        quote: "\uC774\uAE30\uACE0 \uC9C0\uB294 \uAC83 \uB610\uD55C \uD750\uB984\uC774\uC9C0\uC694. \uC624\uB298\uC740 \uD750\uB984\uC774 \uC774\uCABD\uC5D0 \uC788\uC5C8\uC744 \uBFD0."
      },
      "gang-muyeol": {
        line: "\uAC15\uBB34\uC5F4\uC740 \uB3C4\uB97C \uB2E6\uC544 \uB123\uACE0, \uAC00\uBB38\uC774 \uC788\uB294 \uBD81\uCABD \uD558\uB298\uC744 \uD55C \uBC88 \uC62C\uB824\uB2E4\uBCF4\uC558\uB2E4.",
        quote: "\uC774 \uC774\uB984, \uBD80\uB044\uB7FD\uC9C0 \uC54A\uAC8C \uC4F0\uACA0\uC2B5\uB2C8\uB2E4."
      },
      "dokgo-yeon": {
        line: "\uB3C5\uACE0\uC5F0\uC740 \uD658\uD638\uC5D0 \uB2F5\uD558\uC9C0 \uC54A\uC558\uB2E4. \uB2E4\uB9CC \uAC80\uB05D\uC774, \uC544\uC8FC \uC7A0\uC2DC \uB5A8\uB838\uB2E4.",
        quote: "\uB3C5\uACE0(\u7368\u5B64)\uB294, \uC544\uC9C1 \uB05D\uB098\uC9C0 \uC54A\uC558\uB2E4."
      }
    }
  },
  // ── 깨달음 — 절정·초절정 벽을 깨는 순간(폐관·실전 공용, 제자당 회차 최대 2회) ──
  {
    eventId: "enlightenment",
    hanzi: "\u609F",
    title: "\uAE68\uB2EC\uC74C",
    tone: "ink",
    defaultLine: "{name}\uC774 \uBB38\uB4DD \uBA48\uCDB0 \uC130\uB2E4. \uCC9C \uBC88\uC744 \uB450\uB4DC\uB824\uB3C4 \uAFC8\uCA4D \uC54A\uB358 \uBCBD\uC774, \uC624\uB298 \uC18C\uB9AC \uC5C6\uC774 \uBB34\uB108\uC838 \uB0B4\uB838\uB2E4.",
    byDisciple: {
      "jang-cheol": {
        line: "\uC7A5\uCCA0\uC740 \uC624\uB798\uB3C4\uB85D \uC81C \uB450 \uC190\uC744 \uB0B4\uB824\uB2E4\uBCF4\uC558\uB2E4. \uD3C9\uC0DD \uBC2D\uC744 \uAC08\uACE0 \uBCBD\uC744 \uBC84\uD2F0\uB358 \uC190\uC774, \uC624\uB298 \uCC98\uC74C\uC73C\uB85C \uAC00\uBCBC\uC6E0\uB2E4.",
        quote: "\uC9C0\uD0A4\uB294 \uAC83\uACFC \uBC84\uD2F0\uB294 \uAC83\uC774\u2026\u2026 \uAC19\uC740 \uAC83\uC774\uC5C8\uC5B4\uC694, \uC0AC\uBD80\uB2D8."
      }
    }
  },
  // ── 치명상 생환 — 즉사 없음 룰의 세 갈래(docs/29 생존 체인). 살린 경로마다 다른 컷 ──
  {
    eventId: "fatal_rescue_elixir",
    hanzi: "\u751F",
    title: "\uAD6C\uC0AC\uC77C\uC0DD \u2014 \uC601\uC57D",
    tone: "blood",
    defaultLine: "\uAE08\uCC3D\uC601\uC57D\uC774 {name}\uC758 \uC785\uC220 \uC0AC\uC774\uB85C \uD758\uB7EC\uB4E4\uC5C8\uB2E4. \uB04A\uACBC\uB358 \uC228\uC774, \uAE38\uAC8C \uB3CC\uC544\uC654\uB2E4."
  },
  {
    eventId: "fatal_rescue_medic",
    hanzi: "\u91AB",
    title: "\uAD6C\uC0AC\uC77C\uC0DD \u2014 \uC758\uC220",
    tone: "blood",
    defaultLine: "\uB3D9\uD589\uD55C \uC758\uC6D0\uC758 \uCE68\uC774 \uD608\uC744 \uC9DA\uC790, {name}\uC758 \uB0AF\uC5D0 \uD54F\uAE30\uAC00 \uB3CC\uC544\uC654\uB2E4."
  },
  {
    eventId: "fatal_rescue_village",
    hanzi: "\u547D",
    title: "\uAD6C\uC0AC\uC77C\uC0DD \u2014 \uC0AC\uD22C",
    tone: "blood",
    defaultLine: "{name}\uC744 \uC5C5\uACE0 \uBC24\uAE38\uC744 \uB0B4\uB2EC\uB838\uB2E4. \uB9C8\uC744 \uC758\uC6D0 \uBB38\uD131\uC5D0\uC11C \u2014 \uC228\uC774, \uB3CC\uC544\uC654\uB2E4."
  },
  {
    // 선천진기 — 영약도 의원도 없는 사경. 타고난 진원을 끌어올려 죽음을 떨친다. 대가는 근본의 손상.
    eventId: "fatal_rescue_innate",
    hanzi: "\u771E",
    title: "\uC120\uCC9C\uC9C4\uAE30(\u5148\u5929\u771E\u6C23) \u2014 \uC9C4\uC6D0\uC744 \uD0DC\uC6B0\uB2E4",
    tone: "blood",
    defaultLine: "\uC601\uC57D\uB3C4, \uC758\uC6D0\uB3C4 \uC5C6\uC5C8\uB2E4. \uB2E8\uC804 \uAC00\uC7A5 \uAE4A\uC740 \uACF3 \u2014 \uD0C0\uACE0\uB09C \uC9C4\uC6D0\uC774 \uB9C8\uC9C0\uB9C9\uC73C\uB85C \uB053\uC5B4\uC62C\uB790\uB2E4. {name}\uC740 \uD53C\uB97C \uD1A0\uD558\uBA70 \uC77C\uC5B4\uC130\uB2E4. \uC8FD\uC74C\uC740 \uB5A8\uCCE4\uC73C\uB098, \uADFC\uBCF8\uC774 \uC0C1\uD574 \uACF5\uB825\uC774 \uD769\uC5B4\uC84C\uB2E4."
  },
  // ── 전용 아크 컷 — 캐릭터별 정점·시그니처(docs/20 ②). 노선/사건에 도달한 제자만 발화, 칸 비면 폴백 ──
  // 호위 노선 정점 — 상단 총관(호위 사다리 끝) 등극. 성인 컷. 트리거: careerSystem 직책 정점(후속).
  {
    eventId: "career_peak_escort",
    hanzi: "\u5B88",
    title: "\uD638\uC704\uC758 \uC815\uC810 \u2014 \uC0C1\uB2E8 \uCD1D\uAD00",
    tone: "gold",
    defaultLine: "{name}\uC774 \uC0C1\uB2E8\uC758 \uAE43\uBC1C \uC544\uB798 \uC130\uB2E4. \uD3C9\uC0DD \uB204\uAD70\uAC00\uC758 \uB4A4\uB97C \uC9C0\uCF1C \uC628 \uAE38\uC774, \uB9C8\uCE68\uB0B4 \uC218\uBC31 \uBA85\uC758 \uC55E\uC744 \uC9C0\uD0A4\uB294 \uC790\uB9AC\uC5D0 \uB2FF\uC558\uB2E4.",
    byDisciple: {
      "jang-cheol": {
        line: "\uC7A5\uCCA0\uC740 \uC0C1\uB2E8\uC758 \uD070 \uAE43\uBC1C \uC544\uB798 \uC6B0\uB69D \uC130\uB2E4. \uC5B4\uB9B4 \uC801 \uBCBD\uC744 \uBC84\uD2F0\uB358 \uADF8 \uC190\uC73C\uB85C, \uC774\uC81C \uD55C \uC0C1\uB2E8\uC758 \uC55E\uC744 \uC9C0\uD0A8\uB2E4.",
        quote: "\uC9C0\uD0A4\uB294 \uC790\uB9AC\uC5D0 \uB05D\uC774 \uC788\uB2E4\uBA74\u2026\u2026 \uC5EC\uAE30\uAE4C\uC9C0 \uC640\uB3C4 \uB418\uACA0\uC9C0\uC694, \uC0AC\uBD80\uB2D8."
      }
    }
  },
  // 고향을 지키다 — 도적떼에게서 고향 마을을 구함(가족 위협·호위 의뢰). 청소년 시그니처 컷.
  {
    eventId: "hometown_defense",
    hanzi: "\u9115",
    title: "\uACE0\uD5A5\uC744 \uC9C0\uD0A4\uB2E4",
    tone: "ink",
    defaultLine: "{name}\uC774 \uC81C \uC190\uC73C\uB85C \uACE0\uD5A5 \uC5B4\uADC0\uB97C \uB9C9\uC544\uC130\uB2E4. \uC5B4\uB9B4 \uC801 \uB9E4\uC77C \uC9C0\uB098\uB358 \uADF8 \uAE38\uBAA9\uC774\uC5C8\uB2E4.",
    byDisciple: {
      "jang-cheol": {
        line: "\uC7A5\uCCA0\uC740 \uB3C4\uC801\uB5BC \uC55E\uC5D0 \uD640\uB85C \uACE0\uD5A5 \uC5B4\uADC0\uB97C \uB9C9\uC544\uC130\uB2E4. \uB4F1 \uB4A4\uB85C, \uC5B4\uB9B4 \uC801 \uBE75\uC744 \uB098\uB220 \uBA39\uB358 \uACE8\uBAA9\uC774 \uC788\uC5C8\uB2E4.",
        quote: "\uC5EC\uAE30 \uC0AC\uB78C\uB4E4\uC740\u2026\u2026 \uC81C\uAC00 \uC9C0\uD0B5\uB2C8\uB2E4. \uADF8\uB7EC\uB824\uACE0 \uBC30\uC6B4 \uBB34\uACF5\uC774\uB2C8\uAE4C\uC694."
      }
    }
  }
];
function findCutscene(eventId) {
  return CUTSCENES.find((c) => c.eventId === eventId);
}

// src/stores/cutsceneStore.ts
init_esm();
var useCutsceneStore = create((set) => ({
  queue: [],
  push: (c) => set((s) => ({ queue: [...s.queue, c] })),
  pop: () => set((s) => ({ queue: s.queue.slice(1) })),
  clear: () => set({ queue: [] })
}));

// src/systems/cutsceneSystem.ts
function playCutscene(eventId, disciple, opts) {
  const def = findCutscene(eventId);
  if (!def) return;
  const variant = def.byDisciple?.[disciple.id];
  const day = useTimeStore.getState().totalDay;
  useCutsceneStore.getState().push({
    id: `cs-${day}-${eventId}-${disciple.id}-${Math.floor(random() * 1e6)}`,
    eventId,
    discipleId: disciple.id,
    discipleName: disciple.name,
    hanzi: def.hanzi,
    title: def.title,
    tone: def.tone,
    line: fillName(variant?.line ?? def.defaultLine, { name: disciple.name }),
    quote: variant?.quote,
    mediaVariant: opts?.mediaVariant,
    frameWidth: opts?.frame?.width,
    frameHeight: opts?.frame?.height,
    frameLabel: opts?.frame?.label
  });
}

// src/systems/elixirSystem.ts
function hasDivineElixir() {
  return useItemStore.getState().items.some((i) => i.id === DIVINE_ELIXIR_ID && i.count > 0);
}
function consumeDivineElixir() {
  const store2 = useItemStore.getState();
  const it = store2.items.find((i) => i.id === DIVINE_ELIXIR_ID && i.count > 0);
  if (!it) return false;
  store2.adjustCount(DIVINE_ELIXIR_ID, -1);
  return true;
}
function grantDivineElixir() {
  useItemStore.getState().add(divineElixirItem());
}

// src/systems/trainingSystem.ts
init_martialArts();
init_constants();

// src/stores/scheduleStore.ts
init_esm();
init_middleware();
init_persistStorage();
var DEFAULT_PATTERN = [
  "martial",
  "physical",
  "study",
  "rest",
  "martial",
  "physical",
  "rest"
];
var DEFAULT_SCHEDULE = {
  weeklyPattern: [...DEFAULT_PATTERN],
  monthlyQuests: 0
};
var useScheduleStore = create()(
  persist(
    (set) => ({
      schedule: DEFAULT_SCHEDULE,
      individualPatterns: {},
      dailyChoice: {},
      pendingReport: false,
      pendingSetup: false,
      lastSnapshot: null,
      overrides: {},
      setSchedule: (s) => set({ schedule: s }),
      setIndividualPattern: (discipleId, pattern) => set((s) => ({
        individualPatterns: { ...s.individualPatterns, [discipleId]: pattern }
      })),
      clearIndividualPattern: (discipleId) => set((s) => {
        const { [discipleId]: _, ...rest } = s.individualPatterns;
        return { individualPatterns: rest };
      }),
      setDailyChoice: (discipleId, category, optionId) => set((s) => ({
        dailyChoice: {
          ...s.dailyChoice,
          [discipleId]: { ...s.dailyChoice[discipleId], [category]: optionId }
        }
      })),
      openMonthlyReport: () => set({ pendingReport: true }),
      resolveMonthlyReport: () => set({ pendingReport: false }),
      openMonthlySetup: () => set({ pendingSetup: true }),
      resolveMonthlySetup: () => set({ pendingSetup: false }),
      setSnapshot: (s) => set({ lastSnapshot: s }),
      setOverride: (o) => set((s) => ({ overrides: { ...s.overrides, [o.discipleId]: o } })),
      clearOverride: (id) => set((s) => {
        const { [id]: _, ...rest } = s.overrides;
        return { overrides: rest };
      }),
      reset: () => set({
        schedule: { weeklyPattern: [...DEFAULT_PATTERN], monthlyQuests: 0 },
        individualPatterns: {},
        dailyChoice: {},
        pendingReport: false,
        pendingSetup: false,
        lastSnapshot: null,
        overrides: {}
      })
    }),
    {
      name: "schedule",
      storage: createJSONStorage(() => slotAwareStorage),
      version: 5,
      // v4→v5 활동 4종 → 카테고리 모델 + 개인 패턴/일일 선택 (훈련 v2)
      partialize: (s) => ({
        schedule: s.schedule,
        individualPatterns: s.individualPatterns,
        dailyChoice: s.dailyChoice,
        overrides: s.overrides,
        lastSnapshot: s.lastSnapshot
      }),
      // v5: 옛 활동값(training/meditation/autonomy) 패턴은 의미가 달라 디폴트로 리셋.
      // overrides·lastSnapshot 만 보존.
      migrate: (persisted) => {
        const p = persisted ?? {};
        return {
          schedule: { weeklyPattern: [...DEFAULT_PATTERN], monthlyQuests: 0 },
          individualPatterns: {},
          dailyChoice: {},
          overrides: p.overrides ?? {},
          lastSnapshot: p.lastSnapshot ?? null
        };
      }
    }
  )
);

// src/systems/trainingSystem.ts
init_realm2();

// src/systems/eventInbox.ts
init_realm();
function realmUpToInbox(d, realm) {
  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `realmup-${d.id}-${realm}-${day}`,
    kind: "report",
    title: `${d.name}, ${REALM_LABEL[realm]}\uC5D0 \uC62C\uB790\uB2E4`,
    preview: `${d.name}\uC758 \uACBD\uC9C0\uAC00 ${REALM_LABEL[realm]}(\uC73C)\uB85C \uC62C\uB77C\uC130\uB2E4.`,
    body: `${d.name}\uC758 \uACBD\uC9C0\uAC00 ${REALM_LABEL[realm]}(\uC73C)\uB85C \uC62C\uB77C\uC130\uB2E4.`,
    priority: "normal",
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: "realm_up", discipleId: d.id, realm }
  });
}

// src/systems/boneRebirthSystem.ts
init_realm2();

// src/systems/simmaSystem.ts
init_martialArts();
var clamp4 = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
function addSimma(discipleId, amount) {
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[discipleId];
  if (!d) return;
  const next = clamp4(Math.round((d.simma ?? 0) + amount), 0, 100);
  if (next !== (d.simma ?? 0)) ds.update(discipleId, { simma: next });
}
var SIMMA_SEVERITY = (simma) => simma >= 88 ? 2 : simma >= 72 ? 3 : 4;
var SEVERITY_DAYS = { 2: 24, 3: 16, 4: 10 };
var SCATTER_PCT = { 2: 0.22, 3: 0.14, 4: 0.07 };
function triggerQiDeviation(discipleId, severityOverride) {
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[discipleId];
  if (!d) return false;
  const simma = d.simma ?? 0;
  const severity = severityOverride ?? SIMMA_SEVERITY(simma);
  const days = SEVERITY_DAYS[severity] ?? 10;
  const base = d.realmProgress ?? { internal: 0, pity: 0, petitioned: false };
  const lost = Math.round(base.internal * (SCATTER_PCT[severity] ?? 0.07));
  ds.update(discipleId, {
    realmProgress: { ...base, internal: Math.max(0, base.internal - lost) },
    stress: clamp4((d.stress ?? 0) + 18, 0, 100),
    simma: Math.max(0, simma - 40)
    // 발작으로 일부 방출
  });
  inflictWound(discipleId, "inner", severity, days);
  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `simma-${d.name}-${day}`,
    kind: "report",
    title: `${d.name} \u2014 \uC8FC\uD654\uC785\uB9C8`,
    preview: `${d.name}\uC774(\uAC00) \uC218\uB828 \uC911 \uC9C4\uAE30\uAC00 \uC5ED\uB958\uD574 \uC4F0\uB7EC\uC84C\uB2E4.`,
    body: `${d.name}\uC774(\uAC00) \uC6B4\uAE30 \uC911 \uC9C4\uAE30\uAC00 \uAC70\uAFB8\uB85C \uD758\uB7EC \uC8FC\uD654\uC785\uB9C8\uC5D0 \uB4E4\uC5C8\uB2E4. \uB0B4\uC0C1\uC744 \uC785\uACE0 \uC313\uC740 \uB0B4\uACF5\uC758 \uC77C\uBD80\uAC00 \uD769\uC5B4\uC84C\uB2E4. \uC548\uC2E0\uB2E8\uC73C\uB85C \uC2EC\uC2E0\uC744 \uB2E4\uC2A4\uB9AC\uAC70\uB098, \uC2DC\uC77C\uC744 \uB450\uACE0 \uC790\uC5F0\uD788 \uAC00\uB77C\uC549\uAE30\uB97C \uAE30\uB2E4\uB824\uC57C \uD55C\uB2E4.`,
    priority: "high",
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: "jianghu_news" }
  });
  return true;
}

// src/systems/boneRebirthSystem.ts
var BONE_REBIRTH_SAFE_SIMMA = 30;
var BONE_REBIRTH_ENDURANCE_BONUS = 4;
function attemptBoneRebirth(discipleId) {
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[discipleId];
  if (!d) return false;
  const simma = d.simma ?? 0;
  const failChance = Math.max(0, (simma - BONE_REBIRTH_SAFE_SIMMA) / 100);
  if (failChance > 0 && random() < failChance) {
    triggerQiDeviation(discipleId);
    return false;
  }
  const strength = d.stats?.strength ?? { level: 0, exp: 0 };
  const endurance = d.stats?.endurance ?? { level: 0, exp: 0 };
  ds.update(discipleId, {
    stats: {
      ...d.stats,
      strength: { ...strength, level: Math.min(100, strength.level + BONE_REBIRTH_STRENGTH_BONUS) },
      endurance: { ...endurance, level: Math.min(100, endurance.level + BONE_REBIRTH_ENDURANCE_BONUS) }
    },
    simma: 0,
    // 탁기·마장 일소
    stress: 0,
    // 심신이 갓난아기처럼 맑아짐
    boneReborn: true,
    // 젊은 육체 회귀 — 근골이 다시 자란다(나이 보정 하한 ×2.4)
    // 상처·내상 완치 — 묵은 상처까지 씻겨 나간다(모든 속성 상처 일소).
    wounds: void 0,
    ...d.status === "injured" ? { status: "training" } : {}
  });
  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `bone-rebirth-${d.id}-${day}`,
    kind: "report",
    title: `${d.name} \u2014 \uD658\uACE8\uD0C8\uD0DC(\u63DB\u9AA8\u596A\u80CE)`,
    preview: `${d.name}\uC758 \uBAB8\uC5D0\uC11C \uAC80\uC740 \uC9C4\uC561\uC774 \uBC30\uC5B4 \uB098\uC624\uB354\uB2C8, \uD3D0\uAD00\uC2E4\uC5D0 \uB9D1\uC740 \uAE30\uC6B4\uC774 \uAC00\uB4DD \uCC3C\uB2E4.`,
    body: `\uAD6C\uC804\uB300\uD658\uB2E8\uC758 \uC57D\uB825\uC774 ${d.name}\uC758 \uC784\uB3C5\uC591\uB9E5\uC744 \uAFF0\uB6AB\uC5C8\uB2E4. \uB9C9\uD614\uB358 \uAE30\uB9E5\uC774 \uCC28\uB840\uB85C \uC5F4\uB9AC\uACE0, \uBB35\uC740 \uD0C1\uAE30\uAC00 \uAC80\uC740 \uC9C4\uC561\uC774 \uB418\uC5B4 \uBAA8\uACF5\uC73C\uB85C \uBC30\uC5B4 \uB098\uC654\uB2E4. \uC0AC\uD758 \uBC24\uB0AE\uC774 \uC9C0\uB098 \uD3D0\uAD00\uC2E4 \uBB38\uC774 \uC5F4\uB838\uC744 \uB54C \u2014 \uBB35\uC740 \uC0C1\uCC98\uB294 \uD754\uC801\uB3C4 \uC5C6\uACE0, \uADFC\uACE8\uC740 \uB2E4\uC2DC \uBE5A\uC5B4\uC84C\uC73C\uBA70, \uB208\uBE5B\uC740 \uAC13\uB09C\uC544\uAE30\uCC98\uB7FC \uB9D1\uC558\uB2E4. \uBAB8\uC774 \uB2E4\uC2DC \uD0DC\uC5B4\uB09C \uAC83\uC774\uB2E4. \uAD73\uC5B4\uAC00\uB358 \uADFC\uACE8\uC774 \uC18C\uB144\uC758 \uAC83\uCC98\uB7FC \uB2E4\uC2DC \uC790\uB77C\uAE30 \uC2DC\uC791\uD55C\uB2E4.`,
    priority: "high",
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: "jianghu_news" }
  });
  return true;
}

// src/systems/daeryeonSystem.ts
init_martialArts();
init_realm2();

// src/data/relationTransitions.ts
var REL_UP = {
  enemy: "distant",
  distant: "neutral",
  neutral: "friend",
  friend: "sworn",
  sworn: "sworn"
};

// src/systems/trainingSystem.ts
function bodyAgeMultiplier(age) {
  if (age <= 12) return 6;
  if (age <= 14) return 4;
  if (age <= 16) return 2.4;
  if (age <= 18) return 1.1;
  return 0.55;
}
function attemptQuestEnlightenment(discipleId, chanceBonus) {
  const store2 = useDiscipleStore.getState();
  const d = store2.disciples[discipleId];
  if (!d) return null;
  const realm = d.realm ?? "samryu";
  const wallTarget = nextRealm(realm);
  if (!wallTarget || !isWallTransition(wallTarget)) return null;
  const mainId = d.mainMartialArtId ?? d.martialArts[0]?.artId;
  const mainGrade = mainId ? findMartialArt(mainId)?.grade : void 0;
  const ceiling = mainGrade ? effectiveRealmCeiling(mainGrade) : realmCeiling();
  if (realmIndex(wallTarget) > realmIndex(ceiling)) return null;
  const internal = d.realmProgress?.internal ?? 0;
  const external = d.stats?.strength?.level ?? 0;
  const mainSeong = mainId ? d.martialArts.find((a) => a.artId === mainId)?.seong ?? 0 : 0;
  if (internal < wallInternalReq(wallTarget) || // 화경은 초절정 내공이면 벽에 선다(나머진 환골탈태)
  external < externalSupportReq(wallTarget) || // 화경은 받침 62 — 나머지 8은 환골탈태가 채움
  mainSeong < REALM_SEONG_GATE[wallTarget]) {
    return null;
  }
  const pity = d.realmProgress?.pity ?? 0;
  if (wallTarget === "hwagyeong") {
    if (!hasDivineElixir()) return null;
    if (random() >= greatEnlightenmentChance(d.insight, "quest")) return null;
    if (!attemptBoneRebirth(discipleId)) return null;
    consumeDivineElixir();
    const boosted = Math.max(internal, REALM_INTERNAL_REQ.hwagyeong);
    store2.update(discipleId, { realm: wallTarget, realmProgress: { internal: boosted, pity: 0, petitioned: false } });
    realmUpToInbox(d, wallTarget);
    return wallTarget;
  }
  const chance = enlightenmentChance(d.insight, wallTarget) + pity * ENLIGHTENMENT_PITY_STEP + chanceBonus;
  const guaranteed = pity + 1 >= ENLIGHTENMENT_PITY_GUARANTEE;
  if (guaranteed || random() < chance) {
    store2.update(discipleId, { realm: wallTarget, realmProgress: { internal, pity: 0, petitioned: false } });
    realmUpToInbox(d, wallTarget);
    playCutscene("enlightenment", { id: discipleId, name: d.name });
    return wallTarget;
  }
  store2.update(discipleId, {
    realmProgress: { internal, pity: pity + 1, petitioned: d.realmProgress?.petitioned ?? false }
  });
  addSimma(discipleId, 6);
  return null;
}

// src/systems/questSystem.ts
function capability(d, domain) {
  const stat = QUEST_DOMAIN_STAT[domain];
  if (stat) return d.stats?.[stat]?.level ?? 0;
  const rating = combatRating(d);
  if (domain === "grand") {
    return Math.max(rating, d.stats?.guarding?.level ?? 0, d.stats?.scouting?.level ?? 0);
  }
  return rating;
}
function canDispatch(d, q) {
  if (d.status !== "training") return false;
  if (q.grade === "extreme") return capability(d, q.domain) >= q.minStat;
  return true;
}
function dispatchQuest(questId, discipleIds) {
  const qs = useQuestStore.getState();
  const quest = qs.board.find((q) => q.id === questId);
  if (!quest || discipleIds.length === 0) return false;
  const ds = useDiscipleStore.getState();
  const leadId = discipleIds[0];
  const leadD = ds.disciples[leadId];
  if (!leadD || !canDispatch(leadD, quest)) return false;
  for (const id of discipleIds.slice(1)) {
    const m = ds.disciples[id];
    if (!m || m.status !== "training") return false;
  }
  const today = useTimeStore.getState().totalDay;
  const durationDays = quest.days ?? quest.weeks * 7;
  qs.addActive({ quest, discipleIds, startedDay: today, dueDay: today + durationDays });
  qs.removeFromBoard(questId);
  for (const id of discipleIds) ds.update(id, { status: "questing" });
  return true;
}
function mainSeongOf(d) {
  const mainId = d.mainMartialArtId ?? d.martialArts[0]?.artId;
  return (mainId ? d.martialArts.find((a) => a.artId === mainId)?.seong : 0) ?? 0;
}
function evalRequire(active, c) {
  const req = c.require;
  if (!req) return { available: true };
  const ds = useDiscipleStore.getState();
  const party = active.discipleIds.map((id) => ds.disciples[id]).filter((d) => d != null);
  if (req.stat && req.min != null) {
    const max = party.reduce((m, d) => Math.max(m, d.stats?.[req.stat]?.level ?? 0), 0);
    if (max < req.min) return { available: false, note: `${STAT_LABEL[req.stat]} ${req.min}\u2191 \uD544\uC694` };
  }
  if (req.martialSeong != null) {
    const max = party.reduce((m, d) => Math.max(m, mainSeongOf(d)), 0);
    if (max < req.martialSeong) return { available: false, note: `\uBB34\uACF5 ${req.martialSeong}\uC131\u2191 \uD544\uC694` };
  }
  if (req.money != null) {
    if ((useSectStore.getState().sect?.resources ?? 0) < req.money) {
      return { available: false, note: `\uC790\uAE08 ${req.money} \uD544\uC694` };
    }
  }
  return { available: true };
}
function pickEvent(active) {
  const gradeIdx = QUEST_GRADE_ORDER.indexOf(active.quest.grade);
  const pool = QUEST_EVENTS.filter(
    (e) => e.domains.includes(active.quest.domain) && (!e.minGrade || QUEST_GRADE_ORDER.indexOf(e.minGrade) <= gradeIdx)
  );
  if (pool.length === 0) return null;
  const total = pool.reduce((s, e) => s + e.weight, 0);
  let r = random() * total;
  for (const e of pool) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return pool[pool.length - 1];
}
function maybeFireEvent(active) {
  if (random() >= QUEST_EVENT_CHANCE[active.quest.grade]) return;
  const event = pickEvent(active);
  if (!event) return;
  const ds = useDiscipleStore.getState();
  const names2 = active.discipleIds.map((id) => ds.disciples[id]?.name ?? "?").join("\xB7");
  const choices = event.choices.map((c) => {
    const { available, note } = evalRequire(active, c);
    return {
      key: c.key,
      label: c.label,
      available,
      note,
      effect: c.effect,
      failEffect: c.failEffect,
      roll: c.roll,
      cost: c.require?.money ?? 0
    };
  });
  const evId = `qevent-${active.quest.id}-${event.id}`;
  useFieldEventStore.getState().push({
    id: evId,
    source: "quest",
    refId: active.quest.id,
    title: `\uC758\uB8B0 \uC911 \uAE09\uBCF4 \u2014 ${QUEST_GRADE_LABEL[active.quest.grade]}\xB7${QUEST_DOMAIN_LABEL[active.quest.domain]}`,
    hanzi: "\u6025",
    tone: "ink",
    sceneLine: `\u300C${active.quest.title}\u300D \uB3C4\uC911, ${names2}\uC5D0\uAC8C \uB73B\uBC16\uC758 \uC77C\uC774 \uB2E5\uCCE4\uB2E4.`,
    prompt: event.prompt,
    who: names2,
    choices
  });
  useQuestStore.getState().updateActive(active.quest.id, { pendingEventId: evId });
}
var OUTCOME_LABEL = {
  full: "\uC644\uC218",
  partial: "\uC131\uACF5",
  crisis: "\uC704\uAE30 \uB05D\uC5D0 \uC131\uACF5",
  fail: "\uC2E4\uD328",
  disaster: "\uC7AC\uB09C"
};
var OUTCOME_SCALE = {
  full: { money: 1, fame: 1, growth: 1 },
  partial: { money: 0.6, fame: 0.5, growth: 0.6 },
  crisis: { money: 1, fame: 1, growth: 1 },
  fail: { money: 0.1, fame: 0, growth: 0.2 },
  disaster: { money: 0, fame: 0, growth: 0 }
};
var SCROLL_DROP = {
  minor: { chance: 0.04, grades: ["novice"] },
  normal: { chance: 0.1, grades: ["novice", "apprentice"] },
  dangerous: { chance: 0.25, grades: ["apprentice", "master"] },
  extreme: { chance: 0.75, grades: ["master", "grandmaster"] }
};
var DOMAIN_SCHOOL_AFFINITY = {
  guard: ["external", "saber", "fist"],
  scout: ["lightness", "hidden"],
  duel: ["sword", "saber", "fist"],
  medicine: ["medical", "qigong"],
  assassin: ["hidden", "sword", "darkArts"],
  grand: ["sword", "saber", "fist", "qigong", "external"]
};
function maybeDropScroll(q) {
  const rule = SCROLL_DROP[q.grade];
  if (!rule || random() >= rule.chance) return false;
  const codex = useCodexStore.getState();
  const pool = MARTIAL_ARTS.filter((a) => {
    if (a.acquisition !== "quest" || codex.hasScroll(a.id)) return false;
    if (rule.grades.includes(a.grade)) return true;
    return a.grade !== "legendary" && (a.prerequisites?.length ?? 0) > 0 && a.prerequisites.every((pr) => codex.hasScroll(pr.artId));
  });
  if (pool.length === 0) return false;
  const affinity = DOMAIN_SCHOOL_AFFINITY[q.domain] ?? [];
  const weighted = pool.flatMap((a) => {
    let w = 1;
    if (affinity.includes(a.school)) w *= 3;
    const chainNext = (a.prerequisites ?? []).every((pr) => codex.hasScroll(pr.artId));
    if (a.prerequisites?.length && chainNext) w *= 8;
    return Array(w).fill(a);
  });
  const art = weighted[Math.floor(random() * weighted.length)];
  const day = useTimeStore.getState().totalDay;
  codex.addScroll({
    artId: art.id,
    acquiredAtRun: 1,
    acquiredAtDay: day,
    // 드랍 비급은 미연구 — 사부가 풀어야(실시간 연구, researchSystem) 가르칠 수 있다. docs/05.
    status: isResearchInstant() ? "complete" : "identified",
    researchProgress: isResearchInstant() ? 100 : 0,
    isTrap: false,
    isIncomplete: false
  });
  useInboxStore.getState().add({
    id: `scroll-${art.id}-${day}`,
    kind: "report",
    title: `\uBE44\uAE09 \uC785\uC218 \u2014 ${art.name}`,
    preview: `\uC758\uB8B0 \uB05D\uC5D0 \uBE44\uAE09 \u300C${art.name}(${art.hanjaName})\u300D\uC774 \uC0AC\uBB38\uC5D0 \uB4E4\uC5C8\uB2E4.`,
    body: `\uC758\uB8B0\uB97C \uB9C8\uCE58\uACE0 \uB3CC\uC544\uC628 \uC9D0 \uC18D\uC5D0\uC11C \uBE44\uAE09 \uD55C \uAD8C\uC774 \uB098\uC654\uB2E4. **${art.name}(${art.hanjaName})** \u2014 ${art.description} \uC0AC\uBB38\uC758 \uC11C\uACE0\uC5D0 \uACE0\uC774 \uB4E4\uC600\uB2E4.`,
    priority: "normal",
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: "jianghu_news" }
  });
  return true;
}
var QUEST_DISASTER_FATALITY = 0.2;
function bodyToughnessMult(d) {
  const strength = d.stats?.strength?.level ?? 0;
  return 1 - Math.min(100, strength) / 150;
}
var QUEST_SEONG_EXP_PER_WEEK = 55;
var QUEST_BODY_EXP_PER_WEEK = 45;
var QUEST_INTERNAL_PER_WEEK = 1.5;
var QUEST_STAT_EXP_PER_WEEK = 28;
var QUEST_GRADE_GROWTH = {
  menial: 0.2,
  //   잡일 — 경험 거의 없음(쉬운 의뢰)
  minor: 0.5,
  //    소무
  normal: 1,
  //   보통
  dangerous: 1.7,
  // 위험(중상 가능) — 경험 프리미엄
  extreme: 2.6
  //  극험(사망 가능) — 최고 프리미엄
};
var QUEST_ENLIGHTENMENT_BONUS = 0.3;
var questRewardMult = 1;
function setQuestRewardMult(n) {
  questRewardMult = n;
}
var DIVINE_DOCTOR_MEDICINE = 40;
var geumchangBudget = 0;
var geumchangUsed = 0;
function setGeumchangBudget(n) {
  geumchangBudget = n;
  geumchangUsed = 0;
}
function consumeGeumchang() {
  if (consumeElixirItem("saengsa-1")) return true;
  if (geumchangUsed >= geumchangBudget) return false;
  geumchangUsed += 1;
  return true;
}
function villageSurviveChance(realm) {
  return Math.min(0.8, 0.45 + realmIndex(realm) * 0.05);
}
var SEONCHEON_INTERNAL_COST = 150;
var SEONCHEON_ENDURANCE_COST = 4;
function survivesFatalBlow(victim, partyIds, ds) {
  if (consumeGeumchang()) return "elixir";
  const hasDivineDoctor = partyIds.some((pid) => {
    if (pid === victim.id) return false;
    const m = ds.disciples[pid];
    return Boolean(m && m.status !== "departed" && (m.stats?.medicine?.level ?? 0) >= DIVINE_DOCTOR_MEDICINE);
  });
  if (hasDivineDoctor) return "medic";
  const internal = victim.realmProgress?.internal ?? 0;
  if (internal >= SEONCHEON_INTERNAL_COST) {
    const insight = victim.insight ?? 1;
    const ambition = victim.personality?.ambition ?? 50;
    const innateChance = Math.max(0.05, Math.min(0.5, 0.1 + insight * 0.05 + (ambition - 50) / 100 * 0.15));
    if (random() < innateChance) return "innate";
  }
  return random() < villageSurviveChance(victim.realm) ? "village" : null;
}
function rollOutcome(active) {
  const q = active.quest;
  const ds = useDiscipleStore.getState();
  const party = active.discipleIds.map((id) => ds.disciples[id]).filter((d) => d != null);
  const caps = party.map((d) => capability(d, q.domain));
  const lead = caps.length ? Math.max(...caps) : 0;
  const headFactor = active.discipleIds.length / Math.max(1, q.recommended);
  let s = (lead - q.minStat) / Math.max(20, q.minStat) + (headFactor - 1) * 0.2;
  const capable = caps.filter((c) => c >= q.minStat).length;
  s += Math.max(0, capable - 1) * 0.12;
  const bestFormation = Math.max(0, ...party.map((d) => d.stats?.formation?.level ?? 0));
  if (bestFormation >= 20) s += 0.15;
  s += active.successDelta ?? 0;
  s = Math.max(-1, Math.min(1.5, s));
  const r = random();
  const risk = QUEST_GRADE_RISK[q.grade];
  if (s >= 0.6) return r < 0.85 ? "full" : "partial";
  if (s >= 0.2) return r < 0.5 ? "full" : r < 0.85 ? "partial" : risk.injury ? "crisis" : "partial";
  if (s >= -0.2) return r < 0.35 ? "partial" : r < 0.7 ? risk.injury ? "crisis" : "partial" : "fail";
  if (r < 0.3) return "fail";
  if (r < 0.7) return risk.injury ? "crisis" : "fail";
  return risk.death ? "disaster" : risk.injury ? "crisis" : "fail";
}
var MARTIAL_DOMAINS = ["duel", "grand"];
var DOMAIN_WOUND = {
  guard: "wound",
  duel: "wound",
  grand: "wound",
  scout: "wound",
  assassin: "poison",
  // 암기·독
  medicine: "wound"
};
function questWoundType(q) {
  return q.woundType ?? DOMAIN_WOUND[q.domain];
}
function gainMainSeongExp(d, expIn) {
  const martialArts = gainMainSeongExpArts(d, expIn);
  if (martialArts) useDiscipleStore.getState().update(d.id, { martialArts });
}
function personaDeltas(q, outcome) {
  const d = {};
  const add = (k, v) => {
    d[k] = (d[k] ?? 0) + v;
  };
  if (outcome !== "fail") {
    switch (q.domain) {
      case "guard":
        add("mercy", 2);
        add("freedom", -1);
        break;
      case "scout":
        add("prudence", 2);
        break;
      case "duel":
        add("integrity", 1);
        add("ambition", 2);
        break;
      case "medicine":
        add("mercy", 3);
        add("warmth", 2);
        break;
      case "assassin":
        add("mercy", -3);
        add("ambition", 1);
        break;
      case "grand":
        add("integrity", 1);
        add("ambition", 2);
        break;
    }
  }
  if (q.gray) {
    add("mercy", -3);
    add("prudence", 1);
  }
  if (outcome === "disaster" || outcome === "crisis") add("prudence", 2);
  return d;
}
function bumpRelations(ids) {
  const ds = useDiscipleStore.getState();
  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      const a = ds.disciples[ids[i]];
      const b = ds.disciples[ids[j]];
      if (!a || !b) continue;
      ds.setRelation(ids[i], ids[j], REL_UP[a.relationships[ids[j]] ?? "neutral"]);
      ds.setRelation(ids[j], ids[i], REL_UP[b.relationships[ids[i]] ?? "neutral"]);
    }
  }
}
var DUEL_POOL = {
  menial: [{ realm: "samryu", qMin: 0.1, qMax: 0.3, w: 1 }],
  // 잡일엔 결투가 없지만 타입 충족용
  minor: [{ realm: "samryu", qMin: 0.3, qMax: 0.8, w: 1 }],
  normal: [
    { realm: "iryu", qMin: 0.3, qMax: 0.9, w: 8 },
    { realm: "ilryu", qMin: 0.15, qMax: 0.35, w: 1.5 }
  ],
  dangerous: [
    { realm: "ilryu", qMin: 0.3, qMax: 0.8, w: 6 },
    { realm: "iryu", qMin: 0.7, qMax: 1, w: 1 },
    { realm: "jeoljeong", qMin: 0.2, qMax: 0.4, w: 2 }
  ],
  extreme: [
    { realm: "jeoljeong", qMin: 0.4, qMax: 0.8, w: 6 },
    { realm: "ilryu", qMin: 0.8, qMax: 1, w: 1 },
    { realm: "chojeoljeong", qMin: 0.15, qMax: 0.35, w: 2 }
  ]
};
var DUEL_ARCHETYPES = ["orthodox", "rogue", "soldier", "assassin"];
var DUEL_FOE_NAME = {
  "q-duel-challenge": "\uBB34\uAD00\uC758 \uACE0\uC218",
  "q-bandit": "\uC0B0\uCC44 \uB450\uBAA9",
  "q-duel-master": "\uC774\uB984\uB09C \uBB34\uC778",
  "q-hyeolsu": "'\uD608\uC218'"
};
function resolveDuelByEngine(active) {
  const q = active.quest;
  const ds = useDiscipleStore.getState();
  const party = active.discipleIds.map((id) => ds.disciples[id]).filter((d) => d != null && d.status !== "departed");
  if (party.length === 0) return null;
  const champion = party.reduce((a, b) => combatRating(a) >= combatRating(b) ? a : b);
  const pool = DUEL_POOL[q.grade];
  const total = pool.reduce((a, p) => a + p.w, 0);
  let roll = random() * total;
  let pick = pool[0];
  for (const p of pool) {
    roll -= p.w;
    if (roll <= 0) {
      pick = p;
      break;
    }
  }
  const quality = Math.max(
    0.05,
    Math.min(1, pick.qMin + random() * (pick.qMax - pick.qMin) - (active.successDelta ?? 0) * 0.3)
  );
  const npc = makeNpcCombatant({
    id: "duel-foe",
    name: DUEL_FOE_NAME[q.id] ?? "\uB9DE\uC218",
    realm: pick.realm,
    archetype: DUEL_ARCHETYPES[Math.floor(random() * DUEL_ARCHETYPES.length)],
    quality
  });
  const r = simulateCombat([combatantFromDisciple(champion)], [npc], {
    mode: "real",
    lethal: false,
    allowRetreat: false
  });
  const me = r.combatants.find((c) => c.id === champion.id);
  const won = r.winner === "A";
  const bloodied = me?.wound != null && me.wound.severity <= 3;
  let outcome;
  let failWound;
  if (won) {
    outcome = bloodied ? "crisis" : "full";
  } else if (me?.wound?.severity === 1) {
    outcome = "disaster";
  } else {
    outcome = "fail";
    failWound = { severity: me?.wound?.severity ?? 2, days: me?.wound?.days ?? 21 };
  }
  return { outcome, championId: champion.id, note: narrateCombat(r), failWound };
}
function resolveQuest(active) {
  const q = active.quest;
  const duel = q.domain === "duel" ? resolveDuelByEngine(active) : null;
  let outcome = duel ? duel.outcome : rollOutcome(active);
  if (active.riskDelta && random() < active.riskDelta) {
    if (outcome === "full" || outcome === "partial") outcome = "crisis";
    else if (outcome === "crisis") outcome = QUEST_GRADE_RISK[q.grade].death ? "disaster" : "crisis";
  }
  const ds = useDiscipleStore.getState();
  const present = active.discipleIds.filter((id) => ds.disciples[id]);
  const hasMedic = present.some((id) => (ds.disciples[id]?.stats?.medicine?.level ?? 0) >= 30);
  let medicSaved = false;
  if (hasMedic) {
    if (outcome === "disaster") {
      outcome = "crisis";
      medicSaved = true;
    } else if (outcome === "crisis") {
      outcome = "partial";
      medicSaved = true;
    }
  }
  const scale = OUTCOME_SCALE[outcome];
  const stat = QUEST_DOMAIN_STAT[q.domain];
  const isMartial = MARTIAL_DOMAINS.includes(q.domain);
  const mult = (active.rewardMult ?? 1) * (active.rewardFlag === "noble" ? 1.5 : 1);
  if (scale.money > 0) {
    useSectStore.getState().adjustResources(Math.round(q.reward.money * scale.money * mult * questRewardMult));
  }
  if (scale.fame > 0) {
    useSectStore.getState().adjustReputation(Math.round(q.reward.fame * scale.fame * mult * 0.6));
  }
  const righteousness = QUEST_DOMAIN_RIGHTEOUSNESS[q.domain] + (q.gray ? -3 : 0);
  if (outcome !== "fail") {
    useSectAtmosphereStore.getState().adjust({
      righteousness,
      unity: present.length >= 2 ? 2 : 0
    });
  }
  if (q.gray) {
    const mag = Math.max(1, Math.round(Math.abs(righteousness) * 0.6));
    const exposure = outcome === "full" ? 0 : outcome === "partial" || outcome === "fail" ? 0.5 : 1;
    const credit = outcome === "full" ? 1 : outcome === "partial" || outcome === "crisis" ? 0.5 : 0;
    applyCovertReputation(mag, exposure, credit, present);
  } else if (outcome !== "fail") {
    applyAlignmentReputation(righteousness, scale.growth || 0.5, present);
  }
  if (outcome !== "fail" && q.faction) {
    adjustSectRep(q.faction, 6);
    for (const id of present) adjustDiscipleRep(id, q.faction, 3);
  }
  let divineElixir = false;
  if (q.grade === "extreme" && (outcome === "full" || outcome === "crisis") && random() < DIVINE_ELIXIR_DROP_RATE) {
    divineElixir = true;
    grantDivineElixir();
    const day = useTimeStore.getState().totalDay;
    useInboxStore.getState().add({
      id: `elixir-${q.id}-${day}`,
      kind: "report",
      title: "\uC2E0\uD488 \uC601\uC57D \u2014 \uCC9C\uC6B4",
      preview: "\uADF9\uD5D8\uC758 \uC758\uB8B0 \uB05D\uC5D0 \uC2E0\uD488 \uC601\uC57D \uAD6C\uC804\uB300\uD658\uB2E8\uC744 \uC5BB\uC5C8\uB2E4.",
      body: "\uADF9\uD5D8\uC758 \uC758\uB8B0 \uB05D\uC5D0 \uCC9C\uC6B4\uC774 \uB530\uB790\uB2E4. \uC2E0\uD488 \uC601\uC57D **\uAD6C\uC804\uB300\uD658\uB2E8**\uC774 \uC0AC\uBB38\uC5D0 \uB4E4\uC5C8\uB2E4. \uD654\uACBD\uC758 \uBCBD \uC55E\uC5D0 \uC120 \uC81C\uC790\uAC00 \uD3D0\uAD00 \uC911 \uBCF5\uC6A9\uD558\uBA74, \uADF8 \uB9C8\uC9C0\uB9C9 \uBCBD\uC744 \uB118\uC744 \uC218 \uC788\uB2E4 \uD55C\uB2E4.",
      priority: "high",
      createdAtDay: day,
      read: false,
      resolved: false,
      payload: { domain: "jianghu_news" }
    });
  }
  const scrollFound = outcome === "full" || outcome === "crisis" ? maybeDropScroll(q) : false;
  const victimIdx = duel ? Math.max(0, present.indexOf(duel.championId)) : present.length ? Math.floor(random() * present.length) : -1;
  let lostName = "";
  let gravelyHurtName = "";
  let rescueRoute = null;
  for (let i = 0; i < present.length; i += 1) {
    const id = present[i];
    const d = ds.disciples[id];
    if (!d) continue;
    let internalGain = 0;
    if (scale.growth > 0) {
      const expFactor = (q.weeks ?? 1) * (QUEST_GRADE_GROWTH[q.grade] ?? 1) * scale.growth;
      if (stat) {
        ds.addStatExp(id, stat, Math.max(1, Math.round(QUEST_STAT_EXP_PER_WEEK * expFactor)));
      } else if (isMartial) {
        gainMainSeongExp(d, Math.max(1, Math.round(QUEST_SEONG_EXP_PER_WEEK * expFactor)));
        const bodyTier = d.efficiency?.strength ?? "\uBCF4\uD1B5";
        const bodyExp = Math.round(
          QUEST_BODY_EXP_PER_WEEK * expFactor * BODY_EFFICIENCY_MULTIPLIER[bodyTier] * bodyAgeMultiplier(currentAge(d))
        );
        if (bodyExp > 0) ds.addStatExp(id, "strength", bodyExp);
      }
      internalGain = Math.round(QUEST_INTERNAL_PER_WEEK * expFactor);
    }
    const baseRp = d.realmProgress ?? { internal: 0, pity: 0, petitioned: false };
    const patch = {
      fame: (d.fame ?? 0) + Math.round(q.reward.fame * scale.fame * mult),
      personality: shiftPersona(d, personaDeltas(q, outcome)),
      ...internalGain > 0 ? { realmProgress: { ...baseRp, internal: baseRp.internal + internalGain } } : {}
    };
    const wtype = questWoundType(q);
    let inflicted = null;
    if (outcome === "disaster" && i === victimIdx) {
      if (random() < QUEST_DISASTER_FATALITY * bodyToughnessMult(d)) {
        const rescue = survivesFatalBlow(d, present, ds);
        if (rescue) {
          inflicted = { severity: 1, days: 28 };
          gravelyHurtName = d.name;
          rescueRoute = rescue;
          if (rescue === "innate") {
            const rp = patch.realmProgress ?? baseRp;
            patch.realmProgress = { ...rp, internal: Math.max(0, rp.internal - SEONCHEON_INTERNAL_COST) };
            const end = d.stats?.endurance;
            if (end) {
              patch.stats = { ...d.stats ?? {}, endurance: { ...end, level: Math.max(0, end.level - SEONCHEON_ENDURANCE_COST) } };
            }
          }
          playCutscene(`fatal_rescue_${rescue}`, { id: d.id, name: d.name });
        } else {
          patch.status = "departed";
          lostName = d.name;
        }
      } else {
        inflicted = { severity: 2, days: 28 };
        gravelyHurtName = d.name;
      }
    } else if (outcome === "disaster") {
      inflicted = { severity: 3, days: 21 };
    } else if (outcome === "crisis" && i === victimIdx) {
      inflicted = { severity: 4, days: 14 };
    } else if (outcome === "partial" && i === victimIdx && (q.grade === "dangerous" || q.grade === "extreme")) {
      inflicted = { severity: 5, days: 5 };
    } else if (outcome === "fail" && duel?.failWound && i === victimIdx) {
      inflicted = duel.failWound;
    } else {
      patch.status = "training";
    }
    ds.update(id, patch);
    if (inflicted) inflictWound(id, wtype, inflicted.severity, inflicted.days);
    if (isMartial && patch.status !== "departed" && scale.growth > 0) {
      attemptQuestEnlightenment(id, QUEST_ENLIGHTENMENT_BONUS);
    }
  }
  const survivors = present.filter((id) => ds.disciples[id]?.status !== "departed");
  if (outcome !== "disaster" && survivors.length >= 2) bumpRelations(survivors);
  const names2 = present.map((id) => ds.disciples[id]?.name ?? "?").join("\xB7");
  const leadId = present[0] ?? active.discipleIds[0];
  const leadName = ds.disciples[present[0]]?.name ?? "\uC81C\uC790";
  const tag = `[${QUEST_GRADE_LABEL[q.grade]}\xB7${QUEST_DOMAIN_LABEL[q.domain]}]`;
  let body;
  if (outcome === "disaster" && lostName) {
    body = `${tag} ${q.title} \u2014 ${names2}
\uC784\uBB34 \uB3C4\uC911 ${josa(lostName, "\uC774", "\uAC00")} \uCE58\uBA85\uC0C1\uC744 \uC785\uC5C8\uB2E4. \uB3D9\uBB38\uB4E4\uC774 \uB9C8\uC744 \uC758\uC6D0\uAE4C\uC9C0 \uC5C5\uACE0 \uB2EC\uB838\uC73C\uB098 \u2014 \uB05D\uB0B4 \uB3CC\uC544\uC624\uC9C0 \uBABB\uD588\uB2E4.`;
  } else if (outcome === "disaster" && gravelyHurtName) {
    const rescueNote = rescueRoute === "elixir" ? "\uCD5C\uC0C1\uAE09 \uAD6C\uAE09\uC601\uC57D\uC774 \uB04A\uC5B4\uC9C0\uB358 \uC228\uC744 \uBD99\uB4E4\uC5C8\uB2E4." : rescueRoute === "medic" ? "\uB3D9\uD589\uD55C \uC758\uC6D0\uC758 \uC190\uC774 \uC8FD\uC74C\uC758 \uBB38\uD131\uC5D0\uC11C \uB04C\uC5B4\uB0C8\uB2E4." : rescueRoute === "innate" ? "\uC601\uC57D\uB3C4 \uC758\uC6D0\uB3C4 \uC5C6\uB294 \uC0AC\uACBD\uC5D0\uC11C, \uD0C0\uACE0\uB09C \uC9C4\uC6D0(\u5148\u5929\u771E\u6C23)\uC744 \uB04C\uC5B4\uC62C\uB824 \uC2A4\uC2A4\uB85C \uC8FD\uC74C\uC744 \uB5A8\uCCE4\uB2E4. \uD5C8\uB098 \uADFC\uBCF8\uC774 \uC0C1\uD574 \uACF5\uB825\uC744 \uC783\uC5C8\uB2E4." : "\uB3D9\uBB38\uB4E4\uC774 \uB9C8\uC744 \uC758\uC6D0\uAE4C\uC9C0 \uC5C5\uACE0 \uB2EC\uB9B0 \uB05D\uC5D0 \uAC00\uAE4C\uC2A4\uB85C \uC0B4\uB838\uB2E4.";
    body = `${tag} ${q.title} \u2014 ${names2}
\uC7AC\uB09C\uC5D0 \uAC00\uAE4C\uC6B4 \uC704\uAE30\uC600\uB2E4. ${josa(gravelyHurtName, "\uC774", "\uAC00")} \uCE58\uBA85\uC0C1\uC744 \uC785\uC5C8\uC73C\uB098 ${rescueNote} \uC624\uB798 \uBAB8\uC838\uB215\uB294\uB2E4.`;
  } else {
    const reward = `\uC790\uAE08 ${Math.round(q.reward.money * scale.money)}${scale.fame > 0 ? " \xB7 \uBA85\uC131 \u2191" : ""}${scale.growth > 0 ? ` \xB7 ${QUEST_DOMAIN_LABEL[q.domain]} \uACBD\uD5D8 \u2191` : ""}`;
    const medicNote = medicSaved ? " (\uB3D9\uD589\uD55C \uC758\uC6D0\uC774 \uD070 \uD654\uB97C \uB9C9\uC558\uB2E4)" : "";
    body = `${tag} ${q.title} \u2014 ${names2}
${OUTCOME_LABEL[outcome]}.${medicNote} ${reward}`;
  }
  if (duel) body += `

${duel.note}`;
  recordQuestResult({
    outcome,
    quest: q,
    partySize: active.discipleIds.length,
    // 파견 인원(단신/합공 판정)
    death: !!lostName,
    fatalSurvived: rescueRoute != null,
    // 치명상에서 살아 돌아옴
    scrollFound,
    divineElixir,
    noble: active.rewardFlag === "noble"
  });
  return {
    id: `quest-${q.id}-${active.dueDay}`,
    kind: "quest",
    discipleId: leadId,
    discipleName: leadName,
    title: `\uC758\uB8B0 ${OUTCOME_LABEL[outcome]}`,
    body
  };
}
function tickQuests() {
  const today = useTimeStore.getState().totalDay;
  const qs = useQuestStore.getState();
  for (const a of qs.active) {
    if (a.eventRolled) continue;
    const span = a.dueDay - a.startedDay;
    if (today - a.startedDay < Math.ceil(span / 2)) continue;
    qs.updateActive(a.quest.id, { eventRolled: true });
    maybeFireEvent(a);
  }
  const due = useQuestStore.getState().active.filter((a) => today >= a.dueDay && !a.pendingEventId);
  if (due.length === 0) return;
  const milestones = [];
  for (const a of due) {
    milestones.push(resolveQuest(a));
    useQuestStore.getState().removeActive(a.quest.id);
  }
  usePendingStore.getState().pushMilestones(milestones);
}

// scripts/sim/extremerisk.ts
init_martialArts();
var N = 1e4;
var pass = 0;
var fail = 0;
function ck(label, cond, detail = "") {
  if (cond) {
    pass += 1;
    console.log(`  PASS  ${label}${detail ? `   ${detail}` : ""}`);
  } else {
    fail += 1;
    console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ""}`);
  }
}
function firstArtByGrade(grade) {
  const a = MARTIAL_ARTS.find((x) => x.grade === grade && x.acquisition === "quest" && x.school === "sword");
  if (!a) throw new Error(`no art grade=${grade}`);
  return a.id;
}
var MASTER_ART = firstArtByGrade("master");
var APPR_ART = firstArtByGrade("apprentice");
function setSect(resources, reputation) {
  useSectStore.getState().setSect({ name: "x", hanjaName: "x", reputation, resources, facilities: [] });
}
function buildDisciple(id, realm, mainSeong, subSeong, strength, internal) {
  return {
    id,
    name: id,
    status: "training",
    relationships: {},
    realm,
    mainMartialArtId: MASTER_ART,
    martialArts: [
      { artId: MASTER_ART, seong: mainSeong, exp: 0, status: "complete", researchProgress: 100, isTrap: false, isIncomplete: false, acquiredAtRun: 1, acquiredAtDay: 0 },
      { artId: APPR_ART, seong: subSeong, exp: 0, status: "complete", researchProgress: 100, isTrap: false, isIncomplete: false, acquiredAtRun: 1, acquiredAtDay: 0 }
    ],
    darknessLevel: 0,
    simma: 0,
    stress: 0,
    trustToMaster: 30,
    qiAttribute: "fire",
    realmProgress: { internal, pity: 0, petitioned: false },
    fame: 0,
    insight: 3,
    personality: { integrity: 50, freedom: 50, warmth: 50, prudence: 50, mercy: 50, ambition: 50 },
    stamina: 100,
    maxStamina: 100,
    stats: {
      guarding: { level: 30, exp: 0 },
      scouting: { level: 30, exp: 0 },
      medicine: { level: 0, exp: 0 },
      strength: { level: strength, exp: 0 },
      endurance: { level: strength, exp: 0 },
      agility: { level: strength, exp: 0 },
      formation: { level: 0, exp: 0 }
    }
  };
}
function extremeDuelQuest(id) {
  return {
    id,
    domain: "duel",
    grade: "extreme",
    title: "\uADF9\uD5D8 \uACB0\uD22C",
    client: "c",
    preview: "",
    weeks: 6,
    reward: { money: 1e3, fame: 28 },
    recommended: 2,
    minStat: 72
  };
}
var BUILDS = [
  // 절정 7성 master (combatRating ~78): 70 + breadth + realmBonus(4)
  { label: "\uC808\uC815 7\uC131 (rating~78)", realm: "jeoljeong", mainSeong: 7, subSeong: 5, strength: 48, internal: 870 },
  // 초절정 8성 master (~91): 80 + breadth + realmBonus(6)
  { label: "\uCD08\uC808\uC815 8\uC131 (rating~91)", realm: "chojeoljeong", mainSeong: 8, subSeong: 6, strength: 56, internal: 1050 },
  // 일류 6성 master (~65): 60 + breadth + realmBonus(2) — 게이트(72) 미달이라 파견 자체가 막힌다(canDispatch).
  { label: "\uC77C\uB958 6\uC131 (rating~65)", realm: "ilryu", mainSeong: 6, subSeong: 5, strength: 35, internal: 520 }
];
function measure(b) {
  const r = { full: 0, crisis: 0, fail: 0, injured: 0, fatal: 0, death: 0, scroll: 0, n: 0 };
  const probe = buildDisciple("probe", b.realm, b.mainSeong, b.subSeong, b.strength, b.internal);
  const rating = combatRating(probe);
  for (let i = 0; i < N; i += 1) {
    useQuestStore.getState().reset();
    useDiscipleStore.getState().reset();
    useInboxStore.getState().reset?.();
    useTimeStore.getState().reset();
    useCodexStore.getState().resetAll?.();
    setSect(1e5, 90);
    setQuestRewardMult(1);
    setGeumchangBudget(0);
    const hero = buildDisciple("hero", b.realm, b.mainSeong, b.subSeong, b.strength, b.internal);
    useDiscipleStore.getState().setAll([hero]);
    const quest = extremeDuelQuest(`xq-${i}`);
    useQuestStore.getState().setBoard([quest]);
    if (!canDispatch(hero, quest)) {
      r.n += 1;
      continue;
    }
    dispatchQuest(quest.id, ["hero"]);
    const act = useQuestStore.getState().active.find((a) => a.quest.id === quest.id);
    if (!act) {
      r.n += 1;
      continue;
    }
    let guard = 0;
    while (useTimeStore.getState().totalDay < act.dueDay && guard < 200) {
      useTimeStore.getState().advanceDay();
      guard += 1;
    }
    tickQuests();
    if (useQuestStore.getState().active.some((a) => a.quest.id === quest.id)) {
      useQuestStore.getState().updateActive(quest.id, { pendingEventId: void 0 });
      tickQuests();
    }
    const ms = usePendingStore.getState().milestones;
    const last = ms[ms.length - 1];
    const title = last?.title ?? "";
    const h = useDiscipleStore.getState().disciples["hero"];
    const died = h?.status === "departed";
    if (title.includes("\uC644\uC218")) r.full += 1;
    else if (title.includes("\uC704\uAE30")) r.crisis += 1;
    else if (title.includes("\uC7AC\uB09C")) {
      if (died) r.death += 1;
      else r.fatal += 1;
    } else if (title.includes("\uC2E4\uD328")) r.fail += 1;
    if (!died && h?.status === "injured" && !title.includes("\uC7AC\uB09C")) r.injured += 1;
    if (useInboxStore.getState().items?.some((it) => it.title?.includes("\uBE44\uAE09 \uC785\uC218"))) r.scroll += 1;
    r.n += 1;
  }
  r.rating = rating;
  return r;
}
seedAmbient(424242);
console.log("\u2550\u2550\u2550 \uADF9\uD5D8 \uACB0\uD22C \uC758\uB8B0 \uC704\uD5D8 \uC815\uBC00 \uCE21\uC815 (N=10000/\uBE4C\uB4DC, \uBB34\uACFC\uAE08=\uC601\uC57D0) \u2550\u2550\u2550\n");
console.log("\uCE21\uC815\uC77C 2026-06-19 \xB7 seed 424242 \xB7 \uB3C4\uBA54\uC778=duel \xB7 \uB2E8\uC2E0 \uD30C\uACAC(\uBB34\uACFC\uAE08 \uCD5C\uC545)\n");
var pct = (x, n) => `${(x / n * 100).toFixed(1)}%`;
var results = [];
for (const b of BUILDS) {
  const r = measure(b);
  results.push({ b, r });
  const rating = r.rating;
  const success = r.full + r.crisis;
  console.log(`\u25A0 ${b.label}  [combatRating=${rating}]`);
  console.log(`   P(\uC131\uACF5=\uC644\uC218+\uC704\uAE30) ${pct(success, r.n)}  (\uC644\uC218 ${pct(r.full, r.n)} \xB7 \uC704\uAE30\uB05D\uC131\uACF5 ${pct(r.crisis, r.n)})`);
  console.log(`   P(\uC2E4\uD328) ${pct(r.fail, r.n)}   P(\uBD80\uC0C1) ${pct(r.injured, r.n)}`);
  console.log(`   P(\uCE58\uBA85\uC0C1 \uC0DD\uC874) ${pct(r.fatal, r.n)}   P(\uC0AC\uB9DD) ${pct(r.death, r.n)}`);
  console.log(`   P(\uC808\uD488/master \uBB34\uACF5\uC11C \uB178\uD68D) ${pct(r.scroll, r.n)}  \u2190 \uD654\uACBD\uC758 \uC5F4\uC1E0
`);
}
var jj = results.find((x) => x.b.realm === "jeoljeong").r;
var cj = results.find((x) => x.b.realm === "chojeoljeong").r;
var il = results.find((x) => x.b.realm === "ilryu").r;
ck(
  "\uC77C\uB958 6\uC131 \u2014 \uADF9\uD5D8 \uAC8C\uC774\uD2B8(72) \uBBF8\uB2EC \u2192 \uC644\uC218 0 (\uD30C\uACAC \uBD88\uAC00)",
  il.full + il.crisis === 0,
  `\uC131\uACF5=${il.full + il.crisis}`
);
ck("\uC808\uC815 7\uC131 \u2014 \uC0AC\uB9DD\uB960 \uD569\uB9AC(0<death<35%)", jj.death / jj.n > 0 && jj.death / jj.n < 0.35, pct(jj.death, jj.n));
ck(
  "\uCD08\uC808\uC815 8\uC131 \u2014 \uC808\uC815\uBCF4\uB2E4 \uC548\uC804(\uC0AC\uB9DD\uB960 \uB354 \uB0AE\uC74C)",
  cj.death / cj.n <= jj.death / jj.n + 5e-3,
  `\uC808\uC815 ${pct(jj.death, jj.n)} vs \uCD08\uC808\uC815 ${pct(cj.death, cj.n)}`
);
ck(
  "\uCD08\uC808\uC815 8\uC131 \u2014 \uC131\uACF5\uB960 \uC808\uC815\uBCF4\uB2E4 \uB192\uC74C",
  (cj.full + cj.crisis) / cj.n > (jj.full + jj.crisis) / jj.n,
  `\uC808\uC815 ${pct(jj.full + jj.crisis, jj.n)} vs \uCD08\uC808\uC815 ${pct(cj.full + cj.crisis, cj.n)}`
);
console.log(`
\u2550\u2550\u2550 \uACB0\uACFC: ${pass} PASS \xB7 ${fail} FAIL \u2550\u2550\u2550`);
process.exit(fail > 0 ? 1 : 0);
/*! Bundled license information:

react/cjs/react.production.js:
  (**
   * @license React
   * react.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react.development.js:
  (**
   * @license React
   * react.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
