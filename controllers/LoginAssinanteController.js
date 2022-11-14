import dbknex from "../data/db_config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import * as dotenv from "dotenv";
dotenv.config();

export const loginAssinante = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    res.status(400).json({ erro: "Login ou senha incorretos." });
    return;
  }

  try {
    const dados = await dbknex("assinantes").where({ email });
    if (dados.lenght == 0) {
      res.status(400).json({ erro: "Login ou senha incorretos." });
      return;
    }

    if (bcrypt.compareSync(senha, dados[0].senha)) {
      const token = jwt.sign(
        {
          assinante_id: dados[0].id,
          assinante_nome: dados[0].nome,
        },
        process.env.JWT_KEY,
        {
          expiresIn: "1h",
        }
      );
      res.status(200).json({ msg: "Ok! Acesso Liberado", token });
    } else {
      res.status(400).json({ id: 0, msg: "Login ou senha incorretos." });
    }
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};
