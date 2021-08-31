"""
Nessa rede, desenvolvemos baseado no tuning e utilizamos os 
dados que melhor performam dado os teste nesse programa.

Não há base de dados de teste aqui pois ja é sabido os melhores
valores para essa rede.

Alem disso, no final do programa fazemos a classificação de 
um registro aleatório.
"""


import pandas as pd
import numpy as np
from keras.models import Sequential
from keras.layers import Dense, Dropout



#Abrindo arquivos de entrada
previsores = pd.read_csv('/home/leonardo/Área de Trabalho/Python/Linse_Python/Curso_redes_neurais/breast_canser/entradas_breast.csv')
classe = pd.read_csv('/home/leonardo/Área de Trabalho/Python/Linse_Python/Curso_redes_neurais/breast_canser/saidas_breast.csv')


rede_neural = Sequential()

#Adicionando a primeira camada oculta à rede:
rede_neural.add(Dense(units=8, activation='relu', kernel_initializer='normal', input_dim= 30))
#zera 20% dos neurônios
rede_neural.add(Dropout(0.2)) #diminue o desvio padrão dos resultados -> sem overfiting

#adicionando mais uma camada
rede_neural.add(Dense(units=8, activation='relu',kernel_initializer='normal'))
#zera 20% dos neurônios
rede_neural.add(Dropout(0.2))

#Camada de saida - usando sigmoide pois vai retornar um valor entre 0 e 1 que indicará a probabilidade de acontecer
rede_neural.add(Dense(units=1, activation='sigmoid'))



rede_neural.compile(optimizer= 'adam', loss= 'binary_crossentropy', metrics=['binary_accuracy'])

rede_neural.fit(previsores, classe, batch_size =10, epochs=100)

novo = np.array([[15.80, 8.34, 118, 900, 0.10, 0.26, 0.08, 0.134, 0.178,
                  0.20, 0.05, 1098, 0.87, 4500, 145.2, 0.005, 0.04, 0.05, 0.015,
                  0.03, 0.007, 23.15, 16.64, 178.5, 2018, 0.14, 0.185,
                  0.84, 158, 0.363]])
previsao = rede_neural.predict(novo)
print(previsao)
previsao = (previsao > 0.5)
print(previsao)