
"""
Implementando uma rede neural de duas camadas que faz o treinamento e validação
com uma base de dados sobre cancer de mama.

Os arquivos de entrada são: entradas_breast e saidas_breast
"""


#Biblioteca para a análise de dados
import pandas as pd

#Importando func que separa a base de dados
from sklearn.model_selection import train_test_split

#Importando keras (biblioteca de redes neurais)
import tensorflow.keras

#Importanto modelo sequencial que é aquela arquitetura de rede neural com varias camadas
from keras.models import Sequential

#Classe dense significa que cada neurônio será ligado ao neurônio sequente. 
from keras.layers import Dense



#Abrindo arquivos de entrada
previsores = pd.read_csv('/home/leonardo/Área de Trabalho/Python/Linse_Python/Curso_redes_neurais/breast_canser/entradas_breast.csv')
classe = pd.read_csv('/home/leonardo/Área de Trabalho/Python/Linse_Python/Curso_redes_neurais/breast_canser/saidas_breast.csv')

#25% da base de dados sera usada para teste e 75% para treinamento da rede
previsores_treinamento, previsores_teste, classe_treinamento, classe_teste = train_test_split(previsores,classe,test_size=0.25)
 
 

#Criando a rede neural
rede_neural = Sequential()


#Adicionando a primeira camada oculta à rede:
"""
-> Units sera (entradas (30) + saida(1<-problema binario))/2
-> Activation recebe a função de ativação que sera usada
-> input_dim é a dimensão/quantidade de parametros da entradas
-> kernel_inicializer indica como iremos inicializar os coeficientes.
"""
rede_neural.add(Dense(units=16, activation='relu',kernel_initializer='random_uniform', input_dim= 30))
#adicionando mais uma camada
rede_neural.add(Dense(units=16, activation='relu',kernel_initializer='random_uniform'))
#Camada de saida - usando sigmoide pois vai retornar um valor entre 0 e 1 que indicará a probabilidade de acontecer
rede_neural.add(Dense(units=1, activation='sigmoid'))



#lr é a learning rate
#decay é de quanto em quanto vai ser decrementado.
#clipvalue é para prender o valor (congela os valores quando atinge o clipvalue. Prender dentro do vale)
otimizador = tensorflow.keras.optimizers.Adam(lr = 0.001, decay = 0.0001, clipvalue = 0.5)


#loss é usada para problemas binarios (sim ou n)
#metrics é a métrica para fazer a avalição
rede_neural.compile(optimizer= otimizador, loss='binary_crossentropy', metrics=['binary_accuracy'])


#fazendo treinamento
#batch é de quantos em quantos registros sera feito o ajuste dos pesos
#epochs é quantas vezes vou fazer o ajuste de pesos
rede_neural.fit(previsores_treinamento, classe_treinamento, batch_size= 10, epochs=100)


#Possível visualização dos pesos da rede: 
pesos0 = rede_neural.layers[0].get_weights()
#print(pesos0)




#Agora ja treinamos a rede e vamos fazer o teste para ver a porcentagem de acerto
previsoes = rede_neural.predict(previsores_teste)
previsoes = (previsoes>0.5)

# comparando e vendo a porcentagem de acerto
from sklearn.metrics import confusion_matrix, accuracy_score

precisao = accuracy_score(classe_teste, previsoes)
print(precisao)

matriz = confusion_matrix(classe_teste, previsoes)
print(matriz)

#Faz a msm coisa que as linhas de cima
resultado = rede_neural.evaluate(previsores_teste, classe_teste)
print(resultado)