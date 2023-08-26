const Thoughts = {
  ACType: { Public: 0, Private: 1 },
  Kind: { Normal: 1, Type: 2, Tag: 4 } // 5 Seems to be "Pinned"
}
const Links = {
  // Relation
  // Direction - Binary flags
  // Meaning
  Kind: { Normal: 1, Type: 2 }
}
// const Links = { // TODO from: https://forums.thebrain.com/post/in-links-json-what-are-these-fields-10616870
//   Relation
//   NoValue = 0,
//   Child = 1,
//   Parent = 2,
//   Jump = 3,
//   Sibling = 4,

//   Direction - Binary flags
//   OneWay = 4, // x1xx, 1 means One-Way Link;
//   DirectionBA = 2, // xx1x, 0 means A -> B, 1 means B -> A, isBackward
//   IsDirected = 1, // xxx1, 1 means Is-Directed; xxx0 means Not-Directed

//   Meaning
//   Normal = 1,
//   InstanceOf = 2, // Type (A) to Normal Thought (B)
//   TypeOf = 3, // Super Type (A) to Type (B)
//   HasEvent = 4,
//   HasTag = 5, // Tag (A) to Normal or Type Thought (B)
//   System = 6,
//   SubTagOf = 7, // Super Tag (A) to Tag (B)

//   Kind
//   Normal = 1,
//   Type = 2,
// }

module.exports = { Thoughts, Links }
