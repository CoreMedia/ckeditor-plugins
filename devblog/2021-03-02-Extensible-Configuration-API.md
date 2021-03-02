Extensible Configuration API
--------------------------------------------------------------------------------

In the [previous post](2021-03-01-RichTextDataProcessor-Configuration-API.md)
we sketched a possible scenario how to provide a configurable filtering API.
One challenge was, that we need to be able to customize the filtering within
the CKEditor configuration section. Customization may include replacing,
extending or even (for whatever reason) disabling an existing filter.

Yet, we want especially at CKEditor configuration level have an easy to write
configuration section. One of the challenges are the parameters to pass. When
we are _between_ the configuration hierarchy, we don't want to have to write
bloated parameter lists, where 80% are just forwarded without ever using them.
We need some _pick, what you want_ approach.

The idea is, to pass an object to the filter functions. Which seems to be
heavy-weight at first glance, provides much flexibility … and can easily be
extended for future scenarios (like adding additional parameters).

Example Hierarchy Processing
--------------------------------------------------------------------------------

Here is a rough example, which you can try at
[TS Playground][example-1]:

```typescript
type EditorConfig = { [key:string]: string };
// Used for named parameters.
interface MapFnParameters {
    el: HTMLElement,
    parent?: MapFn,
    cfg?: EditorConfig,
}
type MapFn = (args: MapFnParameters) => void;
type Config = { [key:string]: MapFn };

const element: HTMLElement = document.createElement("h1");
element.classList.add("initial");

// Some additional configuration options in CKEditor Configuration.
const editorConfig: EditorConfig = {
    "class": "config",
};

const defaultConfig: Config = {
  h1: (args: MapFnParameters) => {
    args.el.classList.add("default");
    args.cfg && args.cfg["class"] && args.el.classList.add(args.cfg["class"]);
  },
};

const customConfig: Config = {
  h1: (args: MapFnParameters) => {
    args.parent && args.parent(args);
    args.el.classList.add("custom");
  },
};

const mapFn: MapFn | undefined = customConfig[element.localName];

mapFn && mapFn({
    el: element,
    parent: defaultConfig[element.localName],
    cfg: editorConfig
});

console.log({className: element.className});
```

Example List Processing
--------------------------------------------------------------------------------

An additional requirement from
[previous post](2021-03-01-RichTextDataProcessor-Configuration-API.md) is the
ability to merge lists of processing instructions. This is especially relevant
for the `toView` section, where we may have a bunch of rules for processing
a paragraph, which represents a heading at certain levels.

Extending the example above, now having two custom configs to be merged, it may
look like this [see TS PlayGround][example-2]:

```typescript
function mergeConfigs(...config: Config[]): Config {
  const result: Config = {};
  config.forEach((c) => {
    Object.keys(c).forEach((k) => {
      if (result.hasOwnProperty(k)) {
        const previousFn: MapFn = result[k];
        const thisFn: MapFn = c[k];
        result[k] = (args: MapFnParameters) => {
          previousFn(args);
          thisFn(args);
        };
      } else {
        result[k] = c[k];
      }
    });
  });
  return result;
}

const customConfig1: Config = {
  h1: (args: MapFnParameters) => {
    args.parent && args.parent(args);
    args.el.classList.add("custom1");
  },
};
const customConfig2: Config = {
  h1: (args: MapFnParameters) => {
    args.parent && args.parent(args);
    args.el.classList.add("custom2");
  },
};
const customConfig: Config = mergeConfigs(customConfig1, customConfig2);
```

Where is the Difference?
--------------------------------------------------------------------------------

The two approaches (hierarchy and list based) are similar. This raises the
question, if there is a common base, or if one could be used to represent the
other.

The main difference is, that for the hierarchical approach we want to be able
to completely override a default behavior. This may be a bugfix, or just
(for the headings example) another class we want to assign instead of
`p--heading-1`.

To use the list approach also for hierarchical approach, we would require some
explicit order to define, a priority. If a priority is higher, this processing
will come last, and thus, enable overriding the original behavior.

But, this comes at cost:

* You need to carefully maintain and document the order attributes, so that
    everyone knows what a higher or lower priority is.

* The continuous processing costs may increase without need, as the super-call
    would always be executed, even if a later instructions completely overrides
    the behavior.

[example-1]: <https://www.typescriptlang.org/play?#code/C4TwDgpgBAogJgS2AewE4GFkDsBmCDmUAvFAN5QDaA1hCAFwDOwqCW+AunVEy21AL4BuAFCtgEVDgCGAY2gBZKWABiWAApTUUgLYRxqBmWFQTUCABsuACQAq8gDIxzEXVmAAaY6bCaIbgPxciipYnqZQMjj4gbCIKBjYePie-MKgkFDBqsRQABSa+AxBSqoaWrr6DACUxAB8UABuyAhwIunQmLgEOeTUtIzMrBzFIQIiwjLYTGbOrsDWdo6zfsA5cMgyAK5zAHQyqBBS4k4uK7kARAAWAIznVSIWp2575lIMDPYITDtScHAXrCQCCk5ju40mWGmEDiaE6SS48CQsMS3RIpC8JnOMle73OXCxKPw5xS4KmqzgEGkm3MwDhBC4dMIaK8Ny4+VQhRGpU0Oj0EmqdSM4QKDB2Fhebw+X2APz+FwpVJpYIxUBFeyiUAAZJrVRzRZF8BQsTiGOd2FqdWrxdjJZ9vr9-mqDUabbj2PcvPwScIJmSIpsmMhtIyGYSeizrmyRVz1DyKvyakR6ujhXqdj4Dm4LbrCunfG52YUPanc9aTXaZQ6LltA9plSYvcIhD6IdNtCUsDGoAAfKCbLAK1jQnI1lDBwkUR67cwbEEAOV57HG7dG2qgK9UuRTpgsXCnKzC3nz8ygCqk1NpE-3zxnMnni8PJgNe5hCS6+CbHt9kOQzh2M-wLdXQYBddD3ZZnmA0CIH4D0gA>
[example-2]: <https://www.typescriptlang.org/play?ssl=24&ssc=1&pln=56&pc=1#code/C4TwDgpgBAogJgS2AewE4GFkDsBmCDmUAvFAN5QDaA1hCAFwDOwqCW+AunVEy21AL4BuAFCtgEVDgCGAY2gBZKWABiWAApTUUgLYRxqBmWFQTUCABsuACQAq8gDIxzEXVmAAaY6bCaIbgPxciipYnqZQMjj4gbCIKBjYePie-MKgkFDBqsRQABSa+AxBSqoaWrr6DACUxAB8UABuyAhwIunQmLgEOeTUtIzMrBzFIQIiwjLYTGbOrsDWdo6zfsA5cMgyAK5zAHQyqBBS4k4uK7kARAAWAIznVSIWp2575lIMDPYITDtScHAXrCQCCk5ju40mWGmEDiaE6SS48CQsMS3RIpC8JnOMle73OXCxKPw5xS4KmqzgEGkm3MwDhBC4dMIaK8Ny4+VQhRGpU0Oj0EmqdSM4QKDB2Fhebw+X2APz+FwpVJpYIxUBFeyiUAAZJrVRzRZF8BQsTiGOd2FqdWrxdjJZ9vr9-mqDUabbj2PcvPwScJhDhNlgZMAENgoLoORBGQxcjsYxD4VBGRR3QzCUKImSoAcGNT5gnU2ihF44wQdjg0DBZJdcrkZDUiPV0eEAPIAIwAVhBAzsaCAo7XS+XK9WqHWGyqTAgcHkszmdpc3k2AO7qVDISCoUC5Ec1RvhUwQ6ZgA4NYObBiqLlYHIzmnUdgiPf7jPAS5fC+ZEpXkgyO8Px+ZiBs1vKhzRIdlOQ-EIyl5SpRzTf8oCPCAT2QM9VHA6o-wQl83ywDCPQQwtH34GYGGgXdHxvYA7xyH8QKw0xUnCfgCIEViDmATZUCvKiRFSCYMy2JhkG0RlrhTLomTTVk8hFS9oIqfk4Io3VCh2HwDjcC1VNFDSzhFViTCtcwJXeO0ZQdC4hJQbRblYr1hELA9VmskTGQAJgkpIehZcTZL1eSeUUgxlJVNU9K07UdPU3w3HwhjjNMqV7TlLEzxs9zlRMBynME9K3MJLzUVDCR8AjQk+3y0TCWudwIiqjyPR9ZzQ0-S8oAAHygf0FVYaFaIawkKEeXZzA2EEADleXvH1tE-bS5pCXIVIsLgRpWMJvFi3MFSkHNE3W54xpkSbps2kwDTWmEEkkxymoPZBnB2Mb8GW10GCm3Q1uWZ53s+iAWJEIA>
