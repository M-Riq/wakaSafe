import { z } from 'zod';

/** Opaque identifier (uuid in the future database, readable ids in the demo seed). */
export const IdSchema = z.string().min(1);
export type Id = z.infer<typeof IdSchema>;

/** Dates travel as ISO 8601 UTC strings (JSON-friendly, identical in both apps). */
export const IsoDateTimeSchema = z.iso.datetime();
export type IsoDateTime = z.infer<typeof IsoDateTimeSchema>;

export const GeoPointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracyMeters: z.number().nonnegative().nullable(),
});
export type GeoPoint = z.infer<typeof GeoPointSchema>;
