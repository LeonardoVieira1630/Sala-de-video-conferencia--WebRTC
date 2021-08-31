"""
Arquivo carrega uma rede neural ja salva e testa ela.
Isso faz com que não precisemos treinar a rede todas as vezes.
"""

import numpy as np
import pandas as pd
from keras.models import model_from_json

arquivo = open('Rede_neural_breast.json', 'r')
estrutura_rede = arquivo.read()
arquivo.close()

classificador = model_from_json(estrutura_rede)
classificador.load_weights('Rede_neural_breast.h5')

novo = np.array([[15.80, 8.34, 118, 900, 0.10, 0.26, 0.08, 0.134, 0.178,
                  0.20, 0.05, 1098, 0.87, 4500, 145.2, 0.005, 0.04, 0.05, 0.015,
                  0.03, 0.007, 23.15, 16.64, 178.5, 2018, 0.14, 0.185,
                  0.84, 158, 0.363]])
previsao = classificador.predict(novo)
print(previsao)
previsao = (previsao > 0.5)
print(previsao)

previsores = pd.read_csv('/home/leonardo/Área de Trabalho/Python/Linse_Python/Curso_redes_neurais/breast_canser/entradas_breast.csv')
classe = pd.read_csv('/home/leonardo/Área de Trabalho/Python/Linse_Python/Curso_redes_neurais/breast_canser/saidas_breast.csv')

classificador.compile(loss='binary_crossentropy', optimizer= 'adam', metrics = ['binary_accuracy'])
resultado = classificador.evaluate(previsores,classe)