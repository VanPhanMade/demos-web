export type Entity = number;

export interface ComponentType<T> {
  readonly id: symbol;
  readonly name: string;
}

export function defineComponent<T>(name: string): ComponentType<T> {
  return {
    id: Symbol(name),
    name
  };
}

export class World {
  private nextEntityId = 1;
  private entities = new Set<Entity>();
  private stores = new Map<symbol, Map<Entity, unknown>>();

  createEntity(): Entity {
    const entity = this.nextEntityId++;
    this.entities.add(entity);
    return entity;
  }

  destroyEntity(entity: Entity): void {
    if (!this.entities.has(entity)) {
      return;
    }

    this.entities.delete(entity);

    for (const store of this.stores.values()) {
      store.delete(entity);
    }
  }

  addComponent<T>(
    entity: Entity,
    component: ComponentType<T>,
    value: T
  ): T {
    this.assertEntity(entity);
    this.getStore(component).set(entity, value);
    return value;
  }

  removeComponent<T>(entity: Entity, component: ComponentType<T>): void {
    this.getStore(component).delete(entity);
  }

  getComponent<T>(
    entity: Entity,
    component: ComponentType<T>
  ): T | undefined {
    return this.getStore(component).get(entity) as T | undefined;
  }

  hasComponent<T>(entity: Entity, component: ComponentType<T>): boolean {
    return this.getStore(component).has(entity);
  }

  query(...components: ComponentType<unknown>[]): Entity[] {
    if (components.length === 0) {
      return [...this.entities];
    }

    const stores = components.map((component) => this.getStore(component));
    stores.sort((left, right) => left.size - right.size);

    const [smallest, ...rest] = stores;
    const result: Entity[] = [];

    for (const entity of smallest.keys()) {
      if (!this.entities.has(entity)) {
        continue;
      }

      if (rest.every((store) => store.has(entity))) {
        result.push(entity);
      }
    }

    return result;
  }

  get size(): number {
    return this.entities.size;
  }

  private getStore<T>(component: ComponentType<T>): Map<Entity, unknown> {
    const existing = this.stores.get(component.id);
    if (existing) {
      return existing;
    }

    const created = new Map<Entity, unknown>();
    this.stores.set(component.id, created);
    return created;
  }

  private assertEntity(entity: Entity): void {
    if (!this.entities.has(entity)) {
      throw new Error(`Entity ${entity} does not exist in the world.`);
    }
  }
}

