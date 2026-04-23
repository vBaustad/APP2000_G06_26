/**
   * Fil: passport.ts
   * Utvikler(e): Vebjørn Baustad
   * Beskrivelse: Passport-strategi med JWT for autentisering.
   */

  import passport from "passport";
  import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from "passport-jwt";
  import { prisma } from "../prisma";

  declare global {
    namespace Express {
      interface User {
        id: number;
        email: string;
        roles: string[];
      }
    }
  }

  function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("Missing JWT_SECRET in apps/api/.env");
    return secret;
  }

  const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: getJwtSecret(),
  };

  passport.use(
    new JwtStrategy(options, async (payload: { userId: number }, done) => {
      try {
        const user = await prisma.bruker.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            epost: true,
            bruker_rolle: {
              select: { rolle: { select: { kode: true } } },
            },
          },
        });

        if (!user) return done(null, false);

        const roles = user.bruker_rolle.map((ur: { rolle: { kode: string } }) => ur.rolle.kode);
        return done(null, { id: user.id, email: user.epost, roles });
      } catch (err) {
        return done(err, false);
      }
    })
  );

  export default passport;