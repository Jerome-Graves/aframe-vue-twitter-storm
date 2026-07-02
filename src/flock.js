// Reynolds boids flocking as an A-Frame system + component.
//
// The system sees every <a-entity boid> and, each frame, steers it with the
// three classic rules -- separation, alignment, cohesion -- plus a soft
// containment force that keeps the flock on screen. Each bird is oriented to
// face its own velocity (the model's local +X is "forward").
import "aframe";

const THREE = AFRAME.THREE;

// desired = (unit(target) * maxSpeed) - vel, clamped to maxForce  (Reynolds steering)
function steer(target, vel, maxSpeed, maxForce, out) {
  out.copy(target);
  const len = out.length();
  if (len > 1e-6) out.multiplyScalar(maxSpeed / len);
  out.sub(vel);
  const f = out.length();
  if (f > maxForce) out.multiplyScalar(maxForce / f);
}

AFRAME.registerSystem("boid", {
  schema: {
    perception: { default: 6 },        // neighbour radius (alignment + cohesion)
    separationDist: { default: 2.6 },  // personal-space radius
    maxSpeed: { default: 9 },
    minSpeed: { default: 3.5 },
    maxForce: { default: 14 },
    bounds: { default: 13 },           // soft spherical boundary
    separation: { default: 1.7 },
    alignment: { default: 1.05 },
    cohesion: { default: 0.9 },
    containment: { default: 3.0 },
  },

  init() {
    this.boids = [];
    // reusable scratch vectors (no per-frame allocation)
    this._sep = new THREE.Vector3();
    this._ali = new THREE.Vector3();
    this._coh = new THREE.Vector3();
    this._acc = new THREE.Vector3();
    this._diff = new THREE.Vector3();
    this._des = new THREE.Vector3();
    this._fwd = new THREE.Vector3(1, 0, 0);
  },

  register(c) { if (this.boids.indexOf(c) === -1) this.boids.push(c); },
  unregister(c) { const i = this.boids.indexOf(c); if (i !== -1) this.boids.splice(i, 1); },

  tick(time, dtMs) {
    const d = this.data;
    const dt = Math.min((dtMs || 16) / 1000, 0.05); // clamp to avoid big jumps
    const boids = this.boids;
    const n = boids.length;
    if (n === 0) return;

    const sep = this._sep, ali = this._ali, coh = this._coh;
    const acc = this._acc, diff = this._diff, des = this._des, fwd = this._fwd;
    const perc2 = d.perception * d.perception;
    const sep2 = d.separationDist * d.separationDist;

    for (let i = 0; i < n; i++) {
      const b = boids[i];
      const p = b.el.object3D.position;
      sep.set(0, 0, 0); ali.set(0, 0, 0); coh.set(0, 0, 0);
      let neighbours = 0, close = 0;

      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const o = boids[j];
        const op = o.el.object3D.position;
        diff.subVectors(p, op);
        const dist2 = diff.lengthSq();
        if (dist2 > perc2) continue;
        ali.add(o.vel);      // alignment: match neighbours' heading
        coh.add(op);         // cohesion: move toward neighbours' centre
        neighbours++;
        if (dist2 < sep2 && dist2 > 1e-6) {
          diff.multiplyScalar(1 / dist2); // separation: push away, stronger when closer
          sep.add(diff);
          close++;
        }
      }

      acc.set(0, 0, 0);
      if (close) { steer(sep, b.vel, d.maxSpeed, d.maxForce, des); acc.addScaledVector(des, d.separation); }
      if (neighbours) {
        ali.multiplyScalar(1 / neighbours);
        steer(ali, b.vel, d.maxSpeed, d.maxForce, des); acc.addScaledVector(des, d.alignment);
        coh.multiplyScalar(1 / neighbours).sub(p);
        steer(coh, b.vel, d.maxSpeed, d.maxForce, des); acc.addScaledVector(des, d.cohesion);
      }

      // soft containment: steer back toward the origin once outside the sphere
      const r = p.length();
      if (r > d.bounds) {
        des.copy(p).multiplyScalar(-d.maxSpeed / (r || 1)).sub(b.vel);
        const f = des.length();
        if (f > d.maxForce) des.multiplyScalar(d.maxForce / f);
        acc.addScaledVector(des, d.containment * Math.min((r - d.bounds) / 3, 1));
      }

      // integrate velocity + clamp speed to a [min, max] band so birds keep gliding
      b.vel.addScaledVector(acc, dt);
      const sp = b.vel.length();
      if (sp > d.maxSpeed) b.vel.multiplyScalar(d.maxSpeed / sp);
      else if (sp < d.minSpeed) {
        if (sp > 1e-4) b.vel.multiplyScalar(d.minSpeed / sp);
        else b.vel.set(d.minSpeed, 0, 0);
      }

      // integrate position and face the direction of travel (model forward = +X)
      p.addScaledVector(b.vel, dt);
      des.copy(b.vel).normalize();
      b.el.object3D.quaternion.setFromUnitVectors(fwd, des);
    }
  },
});

AFRAME.registerComponent("boid", {
  init() {
    const dir = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
    if (dir.lengthSq() < 1e-6) dir.set(1, 0, 0);
    this.vel = dir.normalize().multiplyScalar(this.system.data.maxSpeed * 0.6);
  },
  play() { this.system.register(this); },
  pause() { this.system.unregister(this); },
});
