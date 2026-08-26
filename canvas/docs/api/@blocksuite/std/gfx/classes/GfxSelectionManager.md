[**Canvas API Documentation**](../../../../README.md)

***

[Canvas API Documentation](../../../../README.md) / [@canvas/std](../../README.md) / [gfx](../README.md) / GfxSelectionManager

# Class: GfxSelectionManager

GfxSelectionManager is just a wrapper of std selection providing
convenient method and states in gfx

## Methods

### has()

> **has**(`element`): `boolean`

check if the element is selected in local

#### Parameters

##### element

`string`

#### Returns

`boolean`

***

### hasRemote()

> **hasRemote**(`element`): `boolean`

check if element is selected by remote peers

#### Parameters

##### element

`string`

#### Returns

`boolean`

***

### toggle()

> **toggle**(`element`): `void`

Toggle the selection state of single element

#### Parameters

##### element

`string` | `GfxModel`

#### Returns

`void`
