// src/seeds/role.seed.ts
import { Role } from "src/role/entities/role.entity"
import { DataSource } from "typeorm"


export default class RoleSeed {
  async run(dataSource: DataSource) {
    const repo = dataSource.getRepository(Role)

    const roles = [
      { name: "ADMIN" },
      { name: "JUNTA" },
    ]

    for (const r of roles) {
      const exists = await repo.findOne({ where: { name: r.name } })
      if (!exists) {
        await repo.save(repo.create(r))
      }
    }
  }
}
