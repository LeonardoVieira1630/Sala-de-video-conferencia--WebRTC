"""
Esse código aqui basicamente permite que a gente mude os parametros das func
e tambem compare conjuntos diferentes de parametros.
"""



import pandas as pd
from keras.models import Sequential
from keras.layers import Dense
from keras.layers.core import Dropout
import tensorflow.keras
from sklearn.model_selection import GridSearchCV
#Essa importação vai servir pra fazermos a validação cruzada
from keras.wrappers.scikit_learn import KerasClassifier



#Abrindo arquivos de entrada
previsores = pd.read_csv('/home/leonardo/Área de Trabalho/Python/Linse_Python/Curso_redes_neurais/breast_canser/entradas_breast.csv')
classe = pd.read_csv('/home/leonardo/Área de Trabalho/Python/Linse_Python/Curso_redes_neurais/breast_canser/saidas_breast.csv')


#Função onde criaremos a rede neural
def criarRede(optimizer, loss, kernel_initializer, activation, neurons):
    rede_neural = Sequential()

    #Adicionando a primeira camada oculta à rede:
    """
    -> Units sera (entradas (30) + saida(1<-problema binario))/2
    -> Activation recebe a função de ativação que sera usada
    -> input_dim é a dimensão/quantidade de parametros da entradas
    -> kernel_inicializer indica como iremos inicializar os coeficientes.
    """
    rede_neural.add(Dense(units=neurons, activation=activation, kernel_initializer=kernel_initializer, input_dim= 30))
    #zera 20% dos neurônios
    rede_neural.add(Dropout(0.2)) #diminue o desvio padrão dos resultados -> sem overfiting

    #adicionando mais uma camada
    rede_neural.add(Dense(units=neurons, activation=activation,kernel_initializer=kernel_initializer))
    #zera 20% dos neurônios
    rede_neural.add(Dropout(0.2))

    #Camada de saida - usando sigmoide pois vai retornar um valor entre 0 e 1 que indicará a probabilidade de acontecer
    rede_neural.add(Dense(units=1, activation='sigmoid'))

   

    #loss é usada para problemas binarios (sim ou n)
    #metrics é a métrica para fazer a avalição
    rede_neural.compile(optimizer= optimizer, loss=loss, metrics=['binary_accuracy'])
    return rede_neural

classificador = KerasClassifier(build_fn= criarRede)
parametros = {'batch_size': [10,30],
              'epochs':[50,100],
              'optimizer': ['adam', 'sgd'],
              'loss': ['binary_crossentropy', 'hinge'],
              'kernel_initializer': ['random_uniform', 'normal'],
              'activation': ['relu', 'tanh'],
              'neurons': [16, 8]}

grid_search = GridSearchCV(estimator=classificador, param_grid= parametros, scoring='accuracy', cv=5)
grid_search = grid_search.fit(previsores, classe)
melhores_parametros = grid_search.best_params_
melhor_precisão = grid_search.best_score_
