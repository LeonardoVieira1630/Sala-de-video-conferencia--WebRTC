"""
Esse código tem o intuito de salvar a rede neural.
"""

import pandas as pd
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

#Passando a rede para json
rede_neural_json = rede_neural.to_json()
with open('Rede_neural_breast.json', 'w') as json_file:
    json_file.write(rede_neural_json)

rede_neural.save_weights('Rede_neural_breast.h5')