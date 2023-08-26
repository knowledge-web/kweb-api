# K-web API
Can be accessed: https://k-web.ismandatory.com/api/v0/

## GET /nodes/:id - one node, its neighbours & links
```js
{
  nodes: { <id>: { id, name, label, oneLiner, color, type, tags, birth: { date, place }, death: { date, place } }, ... },
  links: [{ source: id1, target: id2, name, color }, ...]
}
```

## GET /nodes - all node names & ids
```js
[{ name, id }, ...]
```

## GET /icons/:id
Returns a .png

# Working on the API
For this you need (team) access to The Brain (or a copy of the Brain folder).
Will try to start / host `../kweb-ui` also.

```sh
npm install
# start examples
PORT=7575 BRAIN_DIR=../Brain/B02 node .
```

