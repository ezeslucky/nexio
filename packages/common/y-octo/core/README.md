
## Introduction

Y-Octo is a tiny, ultra-fast CRDT collaboration library built for all major platforms. Developers can use Y-Octo as the [Single source of truth](https://en.wikipedia.org/wiki/Single_source_of_truth) for their application state, naturally turning the application into a [local-first](https://www.inkandswitch.com/local-first/) collaborative app.

Y-Octo also has interoperability and binary compatibility with [yjs]. Developers can use [yjs] to develop local-first web applications and collaborate with Y-Octo in native apps alongside web apps.

## Who are using


<a href="https://www.mysc.app/"><img src="https://www.mysc.app/images/logo_blk.webp" width="120px" /></a>

[Mysc](https://www.mysc.app/) is using y-octo in the Rust server, and the iOS/Android client via the Swift/Kotlin bindings (Official bindings coming soon).

## Features

- ✅ Collaborative Text
  - ✅ Read and write styled Unicode compatible data.
  - 🚧 Add, modify and delete text styles.
  - 🚧 Embedded JS data types and collaborative types.
  - ✅ Collaborative types of thread-safe.
- Collaborative Array
  - ✅ Add, modify, and delete basic JS data types.
  - ✅ Recursively add, modify, and delete collaborative types.
  - ✅ Collaborative types of thread-safe.
  - 🚧 Recursive event subscription
- Collaborative Map
  - ✅ Add, modify, and delete basic JS data types.
  - ✅ Recursively add, modify, and delete collaborative types.
  - ✅ Collaborative types of thread-safe.
  - 🚧 Recursive event subscription
- 🚧 Collaborative Xml (Fragment / Element)
- ✅ Collaborative Doc Container
  - ✅ YATA CRDT state apply/diff compatible with [yjs]
  - ✅ State sync of thread-safe.
  - ✅ Store all collaborative types and JS data types
  - ✅ Update event subscription.
  - 🚧 Sub Document.
- ✅ Yjs binary encoding
  - ✅ Awareness encoding.
  - ✅ Primitive type encoding.
  - ✅ Sync Protocol encoding.
  - ✅ Yjs update v1 encoding.
  - 🚧 Yjs update v2 encoding.

