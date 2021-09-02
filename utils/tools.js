class USet extends Set {
  constructor(...args) {
    super(...args);
  }

  clone() {
    const cloned = new this.constructor();
    for (const element of this) cloned.add(element);
    return cloned;
  }

  deleteIndex(index) {
    let i = 0;
    for (const element of this) {
      if (index == i++) {
        this.delete(element);
        return this;
      }
    }
  }

  filter(fn) {
    const filtered = new this.constructor();
    for (const value of this) {
      if (fn(value)) filtered.add(value);
    }
    return filtered;
  }

  find(fn) {
    for (const value of this) {
      if (fn(value)) return value;
    }
    return null;
  }

  first(n) {
    if (n !== undefined) {
      let values = Array(Math.min(parseInt(n, 10), this.size));
      let i = 0;
      for (const value of this) {
        values[i++] = value;
        if (i >= n) break;
      }
      return values;
    } else {
      for (const value of this) {
        return value;
      }
    }
  }

  getIndex(index) {
    let i = 0;
    for (const element of this) {
      if (index == i++) return element;
    }
  }

  join(other) {
    for (const element of other) this.add(element);
    return this;
  }

  map(fn) {
    const mapped = Array(this.size);
    let i = 0;
    for (const element of this) mapped[i++] = fn(element);
    return mapped;
  }

  reduce(fn, value) {
    let accumulator = value;
    for (const element of this) accumulator = fn(accumulator, element);
    return accumulator;
  }

  sort(fn) {
    return [...this].sort(fn);
  }
}

module.exports = {
  USet
};
