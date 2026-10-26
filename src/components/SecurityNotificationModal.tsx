import React from 'react';
import { User, LoginActivity } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  X,
  Smartphone,
  Laptop,
  Clock,
  MapPin,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react';

interface SecurityNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  logins: LoginActivity[];
  currentSessionId: string;
  onAcknowledgeAlerts?: () => void;
}

export const SecurityNotificationModal: React.FC<SecurityNotificationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  logins,
  currentSessionId,
  onAcknowledgeAlerts,
}) => {
  if (!isOpen) return null;

  // Filter logins for the current user
  const userLogins = logins.filter((l) => l.userId === currentUser.id);

  // Other session logins
  const otherDeviceLogins = userLogins.filter((l) => l.sessionId !== currentSessionId);
  const currentSessionLogins = userLogins.filter((l) => l.sessionId === currentSessionId);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#181715] border border-stone-700 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-6 text-stone-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${otherDeviceLogins.length > 0 ? 'bg-amber-950/60 border-amber-500/40 text-amber-400' : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'}`}>
              {otherDeviceLogins.length > 0 ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Segurança da Conta & Notificações</span>
                {otherDeviceLogins.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Acesso Externo
                  </span>
                )}
              </h3>
              <p className="text-xs text-stone-400">
                Histórico de dispositivos que acessaram a conta de <strong>{currentUser.name}</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Alert if multiple devices */}
        {otherDeviceLogins.length > 0 ? (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Acessos detectados em outros navegadores ou aparelhos</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              O sistema identificou logins realizados em outros aparelhos. Se não foi você quem acessou, comunique à coordenação da biblioteca para redefinir sua credencial.
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 font-medium">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Sua conta está segura. Apenas este dispositivo está ativo no momento.</span>
          </div>
        )}

        {/* Logins List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center justify-between">
            <span>Dispositivos & Histórico de Logins</span>
            <span className="text-[11px] text-stone-500 font-normal">{userLogins.length} registros</span>
          </h4>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {userLogins.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#11100E] border border-stone-800 text-center text-xs text-stone-500">
                Nenhuma atividade de login recente registrada ainda.
              </div>
            ) : (
              userLogins.map((lg) => {
                const isCurrentSession = lg.sessionId === currentSessionId;
                const formattedDate = new Date(lg.timestamp).toLocaleString('pt-BR');

                return (
                  <div
                    key={lg.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 text-xs ${
                      isCurrentSession
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-stone-200'
                        : 'bg-[#11100E] border-stone-800 text-stone-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-lg bg-stone-800/80 text-emerald-400 shrink-0 mt-0.5">
                        {lg.device.toLowerCase().includes('mobile') || lg.device.toLowerCase().includes('android') || lg.device.toLowerCase().includes('ios') ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <Laptop className="w-4 h-4" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{lg.device}</span>
                          {isCurrentSession && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Este Aparelho (Atual)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-stone-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formattedDate}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{lg.location || 'Rede Escolar'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 shrink-0">
                      Autorizado
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-800 text-xs">
          <span className="text-[11px] text-stone-500">
            Proteção de Identidade Colégio Unidade Polo
          </span>
          <div className="flex items-center gap-2">
            {otherDeviceLogins.length > 0 && onAcknowledgeAlerts && (
              <button
                type="button"
                onClick={() => {
                  onAcknowledgeAlerts();
                  onClose();
                }}
                className="px-3.5 py-2 bg-[#11100E] hover:bg-stone-800 text-stone-300 rounded-xl font-medium transition-colors cursor-pointer"
              >
                Reconheço estes acessos
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
