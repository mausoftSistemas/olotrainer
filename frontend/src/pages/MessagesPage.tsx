import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  PaperAirplaneIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  PaperClipIcon,
  FaceSmileIcon,
  PhoneIcon,
  VideoCameraIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  read: boolean;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantRole: 'COACH' | 'ATHLETE';
  lastMessage: Message;
  unreadCount: number;
  isOnline: boolean;
  lastSeen?: Date;
}

const MessagesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data - En producción esto vendría de la API
  const [conversations] = useState<Conversation[]>([
    {
      id: '1',
      participantId: '2',
      participantName: 'Carlos Rodríguez',
      participantAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      participantRole: user?.role === 'COACH' ? 'ATHLETE' : 'COACH',
      lastMessage: {
        id: '1',
        senderId: '2',
        senderName: 'Carlos Rodríguez',
        content: '¿Podemos revisar el plan de entrenamiento de esta semana?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        type: 'text',
        read: false
      },
      unreadCount: 2,
      isOnline: true
    },
    {
      id: '2',
      participantId: '3',
      participantName: 'Ana García',
      participantAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
      participantRole: user?.role === 'COACH' ? 'ATHLETE' : 'COACH',
      lastMessage: {
        id: '2',
        senderId: user?.id || '1',
        senderName: user?.firstName + ' ' + user?.lastName || 'Usuario',
        content: 'Perfecto, nos vemos mañana en el gimnasio',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        type: 'text',
        read: true
      },
      unreadCount: 0,
      isOnline: false,
      lastSeen: new Date(Date.now() - 1000 * 60 * 60)
    },
    {
      id: '3',
      participantId: '4',
      participantName: 'Miguel Torres',
      participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      participantRole: user?.role === 'COACH' ? 'ATHLETE' : 'COACH',
      lastMessage: {
        id: '3',
        senderId: '4',
        senderName: 'Miguel Torres',
        content: 'Gracias por los consejos de nutrición',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        type: 'text',
        read: true
      },
      unreadCount: 0,
      isOnline: false,
      lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 3)
    }
  ]);

  const [messages] = useState<Message[]>([
    {
      id: '1',
      senderId: '2',
      senderName: 'Carlos Rodríguez',
      content: 'Hola, ¿cómo estás?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      type: 'text',
      read: true
    },
    {
      id: '2',
      senderId: user?.id || '1',
      senderName: user?.firstName + ' ' + user?.lastName || 'Usuario',
      content: 'Muy bien, gracias. ¿Cómo va tu entrenamiento?',
      timestamp: new Date(Date.now() - 1000 * 60 * 50),
      type: 'text',
      read: true
    },
    {
      id: '3',
      senderId: '2',
      senderName: 'Carlos Rodríguez',
      content: 'Excelente, he estado siguiendo el plan que me diste. ¿Podemos revisar el plan de entrenamiento de esta semana?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      type: 'text',
      read: false
    }
  ]);

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConv = conversations.find(conv => conv.id === selectedConversation);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setIsLoading(true);
    
    // Simular envío de mensaje
    setTimeout(() => {
      setNewMessage('');
      setIsLoading(false);
      // Aquí se agregaría el mensaje a la lista
    }, 500);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const ConversationItem: React.FC<{ conversation: Conversation }> = ({ conversation }) => (
    <div
      onClick={() => setSelectedConversation(conversation.id)}
      className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
        selectedConversation === conversation.id ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
      }`}
    >
      <div className="relative">
        <img
          src={conversation.participantAvatar || `https://ui-avatars.com/api/?name=${conversation.participantName}&background=3b82f6&color=fff`}
          alt={conversation.participantName}
          className="w-12 h-12 rounded-full object-cover"
        />
        {conversation.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
        )}
      </div>
      
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {conversation.participantName}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(conversation.lastMessage.timestamp)}
          </span>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
            {conversation.lastMessage.senderId === user?.id ? 'Tú: ' : ''}
            {conversation.lastMessage.content}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
              {conversation.unreadCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center mt-1">
          <span className={`text-xs px-2 py-1 rounded-full ${
            conversation.participantRole === 'COACH' 
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {conversation.participantRole === 'COACH' ? 'Entrenador' : 'Atleta'}
          </span>
        </div>
      </div>
    </div>
  );

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isOwn = message.senderId === user?.id;
    
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwn 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
        }`}>
          <p className="text-sm">{message.content}</p>
          <p className={`text-xs mt-1 ${
            isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Mensajes - OloTrainer</title>
        <meta name="description" content="Sistema de mensajería para comunicación entre entrenadores y atletas" />
      </Helmet>

      <div className="h-full flex bg-white dark:bg-gray-900">
        {/* Lista de conversaciones */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header de conversaciones */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Mensajes</h1>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Barra de búsqueda */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Lista de conversaciones */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <ConversationItem key={conversation.id} conversation={conversation} />
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No se encontraron conversaciones</p>
              </div>
            )}
          </div>
        </div>

        {/* Área de chat */}
        <div className="flex-1 flex flex-col">
          {selectedConv ? (
            <>
              {/* Header del chat */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative">
                      <img
                        src={selectedConv.participantAvatar || `https://ui-avatars.com/api/?name=${selectedConv.participantName}&background=3b82f6&color=fff`}
                        alt={selectedConv.participantName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {selectedConv.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                      )}
                    </div>
                    <div className="ml-3">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        {selectedConv.participantName}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedConv.isOnline ? 'En línea' : `Visto ${formatTime(selectedConv.lastSeen || new Date())}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <PhoneIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <VideoCameraIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <InformationCircleIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de mensaje */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <PaperClipIcon className="w-5 h-5" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      rows={1}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-2 bottom-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                      <FaceSmileIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isLoading}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <PaperAirplaneIcon className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <PaperAirplaneIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Selecciona una conversación
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Elige una conversación de la lista para comenzar a chatear
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MessagesPage;