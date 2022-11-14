import dbKnex from "../data/db_config.js";

export const verificaConf = async (req, res, next) => {
  const { hash } = req.params;

  try {
    const voto = await dbKnex
      .select("confirmado")
      .from("votos")
      .where({ hash_conf: hash });

    if (voto[0].confirmado == 1) {
      res.status(400).send("Erro, seu voto já foi confirmado");
      return;
    } else {
      next();
    }
  } catch (error) {
    res.status(400).json({ msg: "Erro:" + error.message });
  }
};
