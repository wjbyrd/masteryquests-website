/* Bounded world entities. Positions survive year changes; only restart reseeds.
   Movement uses seconds; walking poses advance only with distance traveled. */
(() => {
  'use strict';
  const { TUNING: T, limit, VEHICLES } = window.LongRunCity;
  const DOORS = Object.freeze({ shop: [163, 137], cafe: [69, 137], factory: [354, 137], bank: [239, 137] });
  class Pedestrian {
    constructor(id, role, x, y, destination, speed) {
      Object.assign(this, { id, type: role, variant: id % 6, x, y, homeY: y, destination, speed,
        direction: destination && destination[0] < x ? -1 : 1, state: 'walk', active: true,
        frame: 0, animationTime: id / 8, timer: 0, visibility: 1, visited: false,
        walkDistance: 0, moving: false, facing: 'side', workTimer: 3 + id % 3 });
    }
    settle() { this.frame = 8; this.moving = false; }
    doorBusy(world) {
      return this.destination && world.people.some(other => other !== this && other.active && other.destination === this.destination &&
        other.state !== 'inside' && (['enter','exit'].includes(other.state) || other.y < other.homeY || (other.visited && other.facing === 'front')));
    }
    turn(direction, nextState = 'walk') {
      if (this.direction === direction && this.facing === 'side') return false;
      this.settle(); this.state = 'turn'; this.timer = T.turnSeconds;
      this.nextDirection = direction; this.afterTurn = nextState; return true;
    }
    move(dx, dy, carrying = false) {
      const distance = Math.hypot(dx, dy);
      if (!distance) { this.settle(); return; }
      const facing = dy < 0 ? 'back' : dy > 0 ? 'front' : 'side';
      if (!this.moving || facing !== this.facing) this.walkDistance = 0;
      this.facing = facing; this.moving = true;
      this.x += dx; this.y += dy; this.walkDistance += distance;
      const pose = Math.floor(this.walkDistance / T.strideDistance * T.walkFrames) % T.walkFrames;
      this.frame = (facing === 'back' ? 14 : facing === 'front' ? 22 : carrying ? 30 : 0) + pose;
    }
    update(dt, world) {
      this.animationTime += dt;
      if (this.state === 'turn') {
        this.timer -= dt; this.frame = 8;
        if (this.timer <= 0) { this.direction = this.nextDirection; this.facing = 'side'; this.state = this.afterTurn; this.walkDistance = 0; }
        return;
      }
      if (this.state === 'wait') {
        this.moving = false; this.frame = this.animationTime % 7 > 6.5 ? 13 : 8;
        return;
      }
      if (['work', 'inspect', 'idle'].includes(this.state)) {
        this.moving = false; this.workTimer -= dt;
        this.frame = this.state === 'work' ? 9 + Math.floor(this.animationTime * 4) % 4 : this.state === 'inspect' ? 13 : 8;
        if (this.workTimer <= 0 && this.jobX != null && this.type !== 'idle') {
          if (this.state === 'work') { this.state = 'inspect'; this.workTimer = 1.3; }
          else if (this.state === 'inspect') { this.state = 'idle'; this.workTimer = .8 + this.variant * .1; }
          else {
            this.jobOrigin ??= this.jobX;
            this.workTarget = Math.abs(this.x - this.jobOrigin) < 1 ? this.jobOrigin + (this.variant % 2 ? -6 : 6) : this.jobOrigin;
            const direction = Math.sign(this.workTarget - this.x);
            if (!this.turn(direction, this.type === 'builder' ? 'carry' : 'reposition')) this.state = this.type === 'builder' ? 'carry' : 'reposition';
          }
        }
        return;
      }
      if (this.state === 'carry' || this.state === 'reposition') {
        const distance = this.workTarget - this.x, step = Math.min(Math.abs(distance), this.speed * dt);
        this.move(Math.sign(distance) * step, 0, this.state === 'carry');
        if (step === Math.abs(distance)) { this.state = 'work'; this.workTimer = 3 + this.variant * .3; this.settle(); }
        return;
      }
      if (this.state === 'inside') {
        this.timer -= dt; this.frame = 8;
        if (this.timer <= 0 && !this.doorBusy(world)) { this.state = 'exit'; this.timer = .4; this.visibility = 0; this.facing = 'front'; this.frame = 22; }
        return;
      }
      if (this.state === 'enter' || this.state === 'exit') {
        this.timer -= dt;
        this.visibility = limit(this.state === 'enter' ? this.timer / .4 : 1 - this.timer / .4, 0, 1);
        this.moving = false; this.frame = this.state === 'enter' ? 14 : 22;
        if (this.timer <= 0) {
          if (this.state === 'enter') { this.state = 'inside'; this.timer = (this.type === 'worker' ? 15 : T.indoorSeconds) + this.variant * .4; }
          else { this.state = 'walk'; this.visited = true; this.leaveDirection = this.variant % 2 ? -1 : 1; this.visibility = 1; }
        }
        return;
      }
      const target = !this.visited && this.destination ? this.destination : null;
      if (target && this.y === this.homeY && Math.abs(this.x - target[0]) <= 12 && this.doorBusy(world)) { this.settle(); return; }
      if (target && Math.abs(this.x - target[0]) <= this.speed * dt) {
        if (this.x !== target[0]) this.move(target[0] - this.x, 0);
        else this.move(0, -Math.min(this.y - target[1], this.speed * dt));
        if (this.y === target[1]) { this.state = 'enter'; this.timer = .4; this.settle(); }
      } else if (this.y < this.homeY) this.move(0, Math.min(this.homeY - this.y, this.speed * dt));
      else {
        const direction = target ? Math.sign(target[0] - this.x) : this.leaveDirection || this.direction;
        if (this.turn(direction)) return;
        // Passing pedestrians use two foot baselines. Followers keep a little room.
        const blocked = world.people.some(other => other !== this && other.active && other.state === 'walk' &&
          other.direction === this.direction && Math.abs(other.y - this.y) < 2 &&
          (other.x - this.x) * this.direction > 0 && (other.x - this.x) * this.direction < 12);
        if (blocked) { this.settle(); return; }
        const travel = this.jobX != null && !this.retiring ? Math.min(this.speed * dt, Math.abs(this.jobX - this.x)) : this.speed * dt;
        this.move(this.direction * travel, 0);
      }
      if (this.x < -18 || this.x > T.width + 18) this.active = false;
    }
  }
  class Vehicle {
    constructor(id, type, lane, x) {
      Object.assign(this, { id, type, lane, x, y: T.laneY[lane], direction: lane ? -1 : 1,
        variant: id % 6, frame: 0, animationTime: 0, active: true, state: 'drive', width: VEHICLES[type].w });
    }
    update(dt, world) {
      const stress = this.type === 'car' ? 0 : world.visual.supplyStress;
      let speed = T.trafficSpeed[this.lane] * (1 - stress * .24);
      let room = Infinity;
      for (const next of world.vehicles) {
        if (next === this || next.lane !== this.lane || !next.active) continue;
        const distance = (next.x - this.x) * this.direction;
        if (distance > 0) room = Math.min(room, distance - (next.width + this.width) / 2 - T.vehicleGap);
      }
      const travel = Math.max(0, Math.min(speed * dt, room));
      this.x += travel * this.direction;
      if (travel > 0) this.animationTime += dt;
      this.frame = Math.floor(this.animationTime * 6) % 2;
      this.state = travel === 0 ? 'wait' : 'drive';
      if (this.x > T.width + this.width || this.x < -this.width) this.active = false;
    }
  }
  class World {
    constructor() { this.reset(); }
    reset() {
      this.people = []; this.vehicles = []; this.time = 0; this.nextId = 0;
      this.spawnClock = { retail: 0, worker: 0, passenger: 0, freight: 0, private: 0 };
      this.randomState = 131; this.visual = null; this.seeded = false;
      this.machineTime = 0; this.loadingTime = 0;
    }
    random() { this.randomState = (1664525 * this.randomState + 1013904223) >>> 0; return this.randomState / 4294967296; }
    person(role, x, y, destination) {
      if (this.people.length >= T.maxPeople) return;
      const person = new Pedestrian(this.nextId++, role, x, y, destination, T.walkSpeed[0] + this.random() * (T.walkSpeed[1] - T.walkSpeed[0]));
      this.people.push(person); return person;
    }
    vehicle(type, lane, x) {
      if (this.vehicles.length >= T.maxVehicles) return false;
      const width = VEHICLES[type].w;
      x ??= lane ? T.width + width / 2 : -width / 2;
      if (this.vehicles.some(v => v.lane === lane && Math.abs(v.x - x) < (width + v.width) / 2 + T.vehicleGap)) return false;
      this.vehicles.push(new Vehicle(this.nextId++, type, lane, x)); return true;
    }
    targets() {
      const v = this.visual;
      return { shopper: Math.round(2 + v.retail * 3), worker: Math.round(v.labor * 3),
        builder: v.privateInvestment < .45 ? 0 : v.privateInvestment > 1.1 ? 2 : 1,
        public: Math.round(v.publicInvestment), idle: Math.round(v.idleLabor) };
    }
    seed() {
      const n = this.targets();
      for (let i = 0; i < n.shopper; i++) this.person('shopper', 18 + i * 27, T.sidewalkY + i % 2 * 2, i % 2 ? DOORS.shop : DOORS.cafe);
      for (let i = 0; i < n.worker; i++) this.person('worker', 289 + i * 21, T.sidewalkY + 2, DOORS.factory);
      this.person('resident', 31, T.frontY, null);
      this.vehicle('car', 0, 66); this.vehicle('van', 1, 251); this.vehicle('industrial', 0, 370);
      this.seeded = true; this.staff(true);
    }
    // Stationary crews have designated sites; arriving crews walk from doors/site edges.
    staff(instant = false) {
      const desired = this.targets();
      for (const role of ['builder', 'public', 'idle']) {
        const members = this.people.filter(p => p.type === role && !p.retiring);
        while (members.length < desired[role] && this.people.length < T.maxPeople) {
          const i = members.length, x = role === 'builder' ? 399 + i * 24 : role === 'public' ? 236 + i * 18 : 126 + i * 17;
          const y = role === 'public' ? T.frontY : T.bottomY;
          const p = this.person(role, instant ? x : x - 17, y, null);
          p.jobX = x; p.state = instant ? (role === 'idle' ? 'wait' : 'work') : 'walk';
          p.frame = instant ? (role === 'idle' ? 8 : 9) : 0; members.push(p);
        }
        for (const p of members.slice(desired[role])) { p.retiring = true; p.jobX = null; p.leaveDirection = 1; if (!p.turn(1)) p.state = 'walk'; }
      }
    }
    update(dt, visual) {
      this.visual = visual;
      if (!this.seeded) this.seed();
      this.time += dt;
      this.machineTime += dt * visual.factoryEfficiency * visual.factoryOutput;
      this.loadingTime += dt * visual.freight;
      this.staff();
      for (const p of this.people) {
        p.update(dt, this);
        if (p.jobX != null && p.state === 'walk' && Math.abs(p.x - p.jobX) < .01) { p.x = p.jobX; p.state = p.type === 'idle' ? 'wait' : 'work'; p.settle(); }
      }
      // Front-to-back per lane ensures followers observe the leader's new position.
      this.vehicles.sort((a, b) => a.lane - b.lane || (b.x - a.x) * a.direction);
      for (const v of this.vehicles) v.update(dt, this);
      this.people = this.people.filter(p => p.active); this.vehicles = this.vehicles.filter(v => v.active);
      this.spawn(dt);
    }
    spawn(dt) {
      const v = this.visual, desired = this.targets();
      for (const key of Object.keys(this.spawnClock)) this.spawnClock[key] += dt;
      const count = type => this.people.filter(p => p.type === type).length;
      if (this.spawnClock.retail >= 2.8 / v.retail && count('shopper') < desired.shopper) {
        const fromLeft = this.random() > .3;
        this.person('shopper', fromLeft ? -12 : 480 + 12, T.sidewalkY + (fromLeft ? 0 : 2), fromLeft && this.random() > .55 ? DOORS.cafe : DOORS.shop);
        this.spawnClock.retail = 0;
      }
      if (this.spawnClock.worker >= 3.8 / v.labor && count('worker') < desired.worker) {
        this.person('worker', 492, T.sidewalkY + 2, DOORS.factory); this.spawnClock.worker = 0;
      }
      if (this.spawnClock.passenger >= 4.5 / v.passenger) {
        if (this.vehicle('car', this.nextId % 2)) this.spawnClock.passenger = 0;
      }
      if (this.spawnClock.freight >= 6 / v.freight) {
        if (this.vehicle(['van', 'delivery', 'industrial'][this.nextId % 3], this.nextId % 2)) this.spawnClock.freight = 0;
      }
      if (v.privateInvestment > 1.1 && this.spawnClock.private >= 14 / v.privateInvestment) {
        if (this.vehicle('construction', 1)) this.spawnClock.private = 0;
      }
    }
    // Frozen users see representative current activity without an animation burst.
    // Existing actors keep their coordinates; only a change in economic state reconciles counts.
    staticState(visual) {
      this.visual = visual;
      if (!this.seeded) this.seed();
      this.staff(true);
      const desired = this.targets();
      for (const role of ['shopper', 'worker']) {
        const members = this.people.filter(p => p.type === role);
        for (const p of members.slice(desired[role])) p.active = false;
        for (let i = members.length; i < desired[role]; i++) this.person(role, role === 'shopper' ? 20 + i * 24 : 290 + i * 20, T.sidewalkY + 2, role === 'shopper' ? DOORS.shop : DOORS.factory);
      }
      this.people = this.people.filter(p => p.active && !p.retiring);
      // Freight scarcity is legible even with motion disabled.
      this.vehicles = this.vehicles.filter(v => v.type === 'car');
      const freightCount = Math.round(visual.freight * 2);
      for (let i = 0; i < freightCount; i++) this.vehicle(i % 2 ? 'delivery' : 'industrial', i % 2, 105 + i * 80);
    }
    doorOpen(name) { const d = DOORS[name]; return this.people.some(p => p.destination === d && ['enter', 'exit'].includes(p.state)); }
    inspect() {
      return { time: this.time, machineTime: this.machineTime, loadingTime: this.loadingTime,
        people: this.people.map(p => ({ ...p })), vehicles: this.vehicles.map(v => ({ ...v })) };
    }
  }
  Object.assign(window.LongRunCity, { DOORS, Pedestrian, Vehicle, World });
})();
