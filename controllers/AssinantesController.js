import dbknex from "../data/db_config.js";
import bcrypt from "bcrypt";

const saltRounds = 10;

export const assinanteIndex = async (req, res) => {
  try {
    const assinantes = await dbknex
      .select("*")
      .from("assinantes")
      .orderBy("nome");
    res.status(200).json(assinantes);
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro " + error.message });
  }
};

export const assinanteStore = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    res.status(400).json({ id: 0, msg: "Insira nome, email e senha." });
    return;
  }
  if (senha.lenght < 8) {
    res
      .status(400)
      .json({ id: 0, msg: "Sua senha deve conter mais que 8 caracteres" });
    return;
  }

  let pequenas = 0;
  let grandes = 0;
  let numeros = 0;
  let simbolos = 0;

  for (const letra of senha) {
    if (/[a-z]/.test(letra)) {
      pequenas++;
    } else if (/[A-Z]/.test(letra)) {
      grandes++;
    } else if (/[0-9]/.test(letra)) {
      numeros++;
    } else {
      simbolos++;
    }
  }

  if (pequenas == 0 || grandes == 0 || numeros == 0 || simbolos == 0) {
    res.status(400).json({
      id: 0,
      msg: "Erro... senha deve letras minúsculas, maiúsculas, números e símbolos",
    });
    return;
  }

  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(senha, salt);

  try {
    const dados = await dbknex("assinantes").insert({
      nome,
      email,
      senha: hash,
    });
    res
      .status(200)
      .json({ id: dados[0], msg: "Assinante incluído com sucesso!" });
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro " + error.message });
  }
};
