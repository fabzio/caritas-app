import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { scholarshipApplication } from '@api/db/schemas/education'
import { eq } from 'drizzle-orm'

// interface GetSpecialitiesArgs {
//   search?: string
// }

export const createScholarshipApplication = async (args: any) => {
  try {
    // First checks if application already exists for this user
    await db
      .select()
      .from(scholarshipApplication)
      .where(eq(scholarshipApplication.userId, args.userId))

    const [{ id }] = await db.transaction(async (tx) => {
      return await tx
        .insert(scholarshipApplication)
        .values(args)
        .returning({ id: scholarshipApplication.id })
    })
    return id
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

// export const createSpeciality = async (
//   args: SpecialityModel.CreateSpeciality,
// ) => {
//   try {
//     const [{ id }] = await db.transaction(async (tx) => {
//       return await tx.insert(speciality).values(args).returning({
//         id: speciality.id,
//       })
//     })
//     return id
//   } catch (e) {
//     if (e instanceof Error) throw new PostgresError(e.message)
//     throw e
//   }
// }
//
// export const getSpecialities = async ({
//   query,
// }: {
//   query: GetSpecialitiesArgs
// }): Promise<SpecialityModel.GetSpecialities> => {
//   try {
//     const { search } = query
//
//     const response = await db.query.speciality.findMany({
//       where: search
//         ? (fields, { ilike }) => ilike(fields.name, `%${search}%`)
//         : undefined,
//     })
//     return response
//   } catch (e) {
//     if (e instanceof Error) throw new PostgresError(e.message)
//     throw e
//   }
// }
