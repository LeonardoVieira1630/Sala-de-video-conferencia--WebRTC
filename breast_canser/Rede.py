"""
Esse arquivo contem uma uma função que cria uma rede neural
"""


from keras.layers.core import Dropout
import pandas as pd
import tensorflow.keras
from keras.models import Sequential
from keras.layers import Dense


#Abrindo arquivos de entrada
previsores = pd.read_csv('/home/leonardo/Área de Trabalho/Python/Linse_Python/Curso_redes_neurais/breast_canser/entradas_breast.csv')
classe = pd.read_csv('/home/leonardo/Área de Trabalho/Python/Linse_Python/Curso_redes_neurais/breast_canser/saidas_breast.csv')


#Função onde criaremos a rede neural
def criarRede():
    rede_neural = Sequential()

    #Adicionando a primeira camada oculta à rede:
    """
    -> Units sera (entradas (30) + saida(1<-problema binario))/2
    -> Activation recebe a função de ativação que sera usada
    -> input_dim é a dimensão/quantidade de parametros da entradas
    -> kernel_inicializer indica como iremos inicializar os coeficientes.
    """
    rede_neural.add(Dense(units=8, activation='relu',kernel_initializer='random_uniform', input_dim= 30))
    #zera 20% dos neurônios
    rede_neural.add(Dropout(0.2)) #diminue o desvio padrão dos resultados -> sem overfiting

    #adicionando mais uma camada
    rede_neural.add(Dense(units=8, activation='relu',kernel_initializer='random_uniform'))
    #zera 20% dos neurônios
    rede_neural.add(Dropout(0.2))

    #adicionando mais uma camada
    rede_neural.add(Dense(units=8, activation='relu',kernel_initializer='random_uniform'))
    #zera 20% dos neurônios
    rede_neural.add(Dropout(0.2))



    #Camada de saida - usando sigmoide pois vai retornar um valor entre 0 e 1 que indicará a probabilidade de acontecer
    rede_neural.add(Dense(units=1, activation='sigmoid'))

    #lr é a learning rate
    #decay é de quanto em quanto vai ser decrementado.
    #clipvalue é para prender o valor (congela os valores quando atinge o clipvalue. Prender dentro do vale)
    otimizador = tensorflow.keras.optimizers.Adam(lr = 0.001, decay = 0.00005, clipvalue = 0.3)

    #loss é usada para problemas binarios (sim ou n)
    #metrics é a métrica para fazer a avalição
    rede_neural.compile(optimizer= otimizador, loss='binary_crossentropy', metrics=['binary_accuracy'])
    return rede_neural

