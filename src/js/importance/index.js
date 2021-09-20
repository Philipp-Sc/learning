// https://github.com/zemlyansky/importance
// updated to work with tensorflow-worker.js 
// removed unused code
// updated to return a promise for each feature importance
// everything still runs in sequence, which is a requirement for tensorflow-worker.js
// just that promises are returned, this allows for callback functions
// and does not block the main thread.

/*
 * model.predict runs on web-worker (async)
 * model.modelScore gets calculated on web-worker (async)
 * JSON.parse(Xstring) called once
 */


// Score a model given input X and target y
function score (model, X, y, kind) {
  if (y.length !== X.length) {
    throw new Error('Arrays have different length')
  } else if (!y.length) {
    throw new Error('Zero length array')
  } else if (kind === 'ce') {
    return model.modelScore(X,y,kind) 
  } else if (kind === 'acc') {
    return model.modelScore(X,y,kind) 
  } else {
    return model.modelScore(X,y,kind).then(value => -1*value);
  }
}

async function permutationScores (model, Xstring, y, kind, id, nRepeats) {
  const scores = []
  for (let r = 0; r < nRepeats; r++) {
    const Xclone = JSON.parse(Xstring)
    for (let i = Xclone.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[Xclone[i][id], Xclone[j][id]] = [Xclone[j][id], Xclone[i][id]]
    }
    scores.push(await score(model, Xclone, y, kind))
  }
  return scores
}

export async function importance (model, X, y, opts = {}) {
  const log = opts.verbose ? console.log : () => {}
  const kind = opts.kind ? opts.kind : (Array.from(new Set(y)).length / y.length > 0.5) ? 'mae' : 'ce'
  const nRepeats = opts.n || 1 
  const baseScore = await score(model, X, y, kind) 
  const nFeatures = X[0].length
  log('Start feature importance')
  log('Score: %s, N repeats: %d, N features: %d', kind, nRepeats, nFeatures)
  log('Base score:', baseScore)

  let importances = []
  const Xstring = JSON.stringify(X);
  for (let i = 0; i < nFeatures; i++) {
    var prev = importances[importances.length-1] || Promise.resolve(undefined) 
    var next = prev.then(e => {
    return permutationScores(model, Xstring, y, kind, i, nRepeats)
      .then(scores => scores.map(score => baseScore - score))
      .then(imp => imp.reduce((a, v) => a + v / nRepeats))
    })
    if(opts.verbose) next = next.then(imp => {log(' - computing importance of feature: %d  ->  %f', i, imp); return imp;})
    importances.push(next);
  }

  return importances;
}
