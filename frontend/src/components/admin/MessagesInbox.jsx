import { Mail, MailOpen, RefreshCw, Trash2 } from 'lucide-react';

export default function MessagesInbox({
  messages,
  loading,
  onRefresh,
  onToggleRead,
  onDelete,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">
            Contact Inquiries ({messages.length})
          </h2>
          <p className="text-xs sm:text-sm text-[#544960] dark:text-[#B8AEBF]">
            Messages submitted from the portfolio contact form.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="px-4 min-h-[40px] rounded-full glass-card text-xs font-medium inline-flex items-center gap-2 disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-sm text-[#544960] dark:text-[#B8AEBF]">
          No messages received yet.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <article
              key={msg.id}
              className={`glass-card rounded-2xl p-5 border-l-4 ${
                msg.isRead ? 'border-l-transparent opacity-85' : 'border-l-[#E0447C]'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-bold text-base">{msg.name}</h3>
                    {!msg.isRead && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#E0447C]/20 text-[#E0447C]">
                        Unread
                      </span>
                    )}
                    {msg.projectType && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#F5B85B]/15 text-[#7A1248] dark:text-[#F5B85B]">
                        {msg.projectType}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-mono text-[#544960] dark:text-[#B8AEBF]">
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-[#E0447C] hover:underline"
                    >
                      {msg.email}
                    </a>
                    <span>{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleRead(msg.id, !msg.isRead)}
                    className="px-3 min-h-[38px] rounded-xl glass-card text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    {msg.isRead ? (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        <span>Mark Unread</span>
                      </>
                    ) : (
                      <>
                        <MailOpen className="w-3.5 h-3.5 text-[#E0447C]" />
                        <span>Mark Read</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(msg.id)}
                    className="px-3 min-h-[38px] rounded-xl border border-red-500/30 text-red-500 text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <p className="mt-3 text-sm text-[#1A1222] dark:text-[#F6F2F8] whitespace-pre-wrap leading-relaxed">
                {msg.message}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
