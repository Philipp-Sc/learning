// https://github.com/zemlyansky/importance
// updated to work with tensorflow-worker.js 

function mae (yt, yp) {
  return yt.reduce((a, v, i) => a + Math.abs(v - yp[i]) / yt.length, 0)
}

function mse (yt, yp) {
  return yt.reduce((a, v, i) => a + Math.pow(v - yp[i], 2) / yt.length, 0)
}

function rmse (yt, yp) {
  return Math.sqrt(mse(yt, yp))
}

function smape (yt, yp) {
  const sum = yt.reduce((a, v, i) => a + Math.abs(v - yp[i]) / (Math.abs(v) + Math.abs(yp[i])), 0)
  return (sum / yt.length) * 100
}

function acc (yt, yp) {
  return yt.reduce((a, v, i) => a + (v === yp[i]) / yt.length, 0)
}

function ce (yt, yp) {
  const eps = 1e-10
  const ce = []
  for (let i = 0; i < yt.length; i++) {
    // Limit probs to (eps, 1 - eps)
    const probs = yp[i].map(classProb => classProb < eps ? eps : classProb > (1 - eps) ? 1 - eps : classProb)
    const sum = probs.reduce((p, v) => p + v, 0)
    ce.push(
      probs
        .map(p => p / sum)
        .map((p, j) => Math.log(p) * (yt[i] === j))
        .reduce((a, v) => a + v, 0)
    )
  }

  const res = ce.reduce((a, v) => a + v / yt.length, 0)
  return res
}

const scoreTypes = {
  mae, mse, rmse, smape, acc, ce
}

// Score a model given input X and target y
async function score (model, X, y, kind) {
  if (y.length !== X.length) {
    throw new Error('Arrays have different length')
  } else if (!y.length) {
    throw new Error('Zero length array')
  } else if (kind === 'ce') {
    return scoreTypes[kind](y, await model.predictProba(X))
  } else if (kind === 'acc') {
    return scoreTypes[kind](y, await model.predict(X))
  } else {
    return -scoreTypes[kind](y, await model.predict(X))
  }
}

async function allPermutationScore (model, X, y, kind, nRepeats) {
  const scores = []
  for (let r = 0; r < nRepeats; r++) {
    const Xclone = JSON.parse(JSON.stringify(X))
    for (let i = Xclone.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[Xclone[i], Xclone[j]] = [Xclone[j], Xclone[i]]
    }
    scores.push(await score(model, Xclone, y, kind))
  }
  return scores.reduce((a, v) => a + v / nRepeats)
}

async function permutationScores (model, X, y, kind, id, nRepeats) {
  const scores = []
  for (let r = 0; r < nRepeats; r++) {
    const Xclone = JSON.parse(JSON.stringify(X))
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
  const onlyMeans = opts.means || (nRepeats === 1)
  const baseScore = await score(model, X, y, kind) 
  const nFeatures = X[0].length
  log('Start feature importance')
  log('Score: %s, N repeats: %d, N features: %d', kind, nRepeats, nFeatures)
  log('Base score:', baseScore)

  let importances = []
  for (let i = 0; i < nFeatures; i++) {
    const imp = await permutationScores(model, X, y, kind, i, nRepeats).then(scores => scores.map(score => baseScore - score));
    log(' - computing importance of feature: %d  ->  %f', i, imp.reduce((a, v) => a + v / imp.length, 0))
    importances.push(imp)
  }

  if (opts.scale) {
    // Return relative permutation importance
    const permScore = await allPermutationScore(model, X, y, kind, nRepeats)
    const bestScore = opts.kind === 'acc' ? 100 : 0
    const factor = (bestScore - permScore)
    log('All-permuted score:', permScore)
    importances = importances.map(imp => imp.map(v => v / (factor !== 0 ? factor : 1)))
  }

  const importancesMeans = importances.map(imps => imps.reduce((a, v) => a + v / nRepeats))
  const importancesStds = importances.map((imps, i) => {
    const std = Math.sqrt(imps.reduce((a, v) => a + Math.pow(v - importancesMeans[i], 2) / nRepeats, 0))
    return std
  })

  return onlyMeans ? importancesMeans : {
    importances,
    importancesMeans,
    importancesStds
  }
}
