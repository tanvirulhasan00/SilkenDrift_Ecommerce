import React, { useState, useEffect } from "react";
import { useLoaderData } from "react-router";
import { firestoreService } from "~/services/firebase/firestoreService";
import { mockRepository } from "~/services/mock/mockStore";
import { useLanguage } from "~/locales";
import { formatDate } from "~/lib/formatters";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
import { useToast } from "~/components/feedback/ToastContext";
import { SupportTicket, ContactMessage } from "~/types";
import {
  Headphones,
  Mail,
  Send,
  Clock,
  User,
  Phone,
  CheckCircle2,
  MessageCircle,
  ExternalLink,
  Archive,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export async function clientLoader() {
  const tickets = mockRepository.getSupportTickets();
  const contactMessages = await firestoreService.getContactMessages();
  return { tickets, contactMessages };
}

export default function AdminSupportPage() {
  const { tickets: initialTickets, contactMessages: initialContactMessages } =
    useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  // Active view tab: "contact" (from storefront /contact page) vs "tickets" (order disputes)
  const [activeTab, setActiveTab] = useState<"contact" | "tickets">("contact");

  // Contact Messages State
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(initialContactMessages);
  const [selectedContactId, setSelectedContactId] = useState<string>(
    initialContactMessages[0]?.id || ""
  );
  const [adminContactReply, setAdminContactReply] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || "");
  const [replyText, setReplyText] = useState("");

  // Real-time listener for contact messages from live Firestore
  useEffect(() => {
    const unsubscribe = firestoreService.subscribeToContactMessages((liveMsgs) => {
      setContactMessages(liveMsgs);
      if (!selectedContactId && liveMsgs.length > 0) {
        setSelectedContactId(liveMsgs[0].id);
      }
    });
    return () => unsubscribe();
  }, [selectedContactId]);

  const activeContactMessage = contactMessages.find((m) => m.id === selectedContactId);
  const activeTicket = tickets.find((t) => t.id === selectedTicketId);

  const unreadContactCount = contactMessages.filter((m) => m.status === "unread").length;

  // Handlers for Contact Inquiries
  const handleUpdateContactStatus = async (
    id: string,
    newStatus: "unread" | "read" | "replied" | "archived",
    replyMsg?: string
  ) => {
    setIsUpdatingStatus(true);
    try {
      await firestoreService.updateContactMessageStatus(id, newStatus, replyMsg);
      setContactMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                status: newStatus,
                ...(replyMsg
                  ? {
                      reply: replyMsg,
                      repliedAt: new Date().toISOString(),
                      repliedBy: "Admin Support",
                    }
                  : {}),
              }
            : m
        )
      );
      if (replyMsg) {
        setAdminContactReply("");
      }
      showToast(
        language === "bn"
          ? "স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে"
          : `Message marked as ${newStatus}`,
        "success"
      );
    } catch (err: any) {
      showToast(err.message || "Failed to update", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    const updated = mockRepository.addTicketMessage(
      activeTicket.id,
      "staff",
      replyText.trim(),
      "Support Lead (Admin)"
    );

    if (updated) {
      setTickets(tickets.map((t) => (t.id === updated.id ? { ...updated } : t)));
      setReplyText("");
      showToast("Reply sent to customer", "success");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
            {t.admin.support}
          </h1>
          <p className="text-xs text-silk-700 dark:text-silk-300 font-medium mt-0.5">
            {language === "bn"
              ? "ওয়েবসাইট কন্টাক্ট পেজ থেকে আসা বার্তা এবং কাস্টমার হেল্পডেস্ক টিকিট পরিচালনা"
              : "Direct inquiries from the storefront contact page & customer helpdesk tickets (Firebase Synced)"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-silk-100 p-1.5 rounded-2xl dark:bg-dark-elevated border border-silk-200 dark:border-dark-border">
          <button
            type="button"
            onClick={() => setActiveTab("contact")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "contact"
                ? "bg-white text-silk-950 shadow-sm dark:bg-dark-surface dark:text-silk-100"
                : "text-silk-600 hover:text-silk-950 dark:text-silk-400 dark:hover:text-silk-200"
            }`}
          >
            <Mail className="w-4 h-4 text-gold-600" />
            <span>{language === "bn" ? "কন্টাক্ট পেজ ইনবক্স" : "Contact Page Messages"}</span>
            {unreadContactCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-crimson-600 text-white font-bold animate-pulse">
                {unreadContactCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tickets")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "tickets"
                ? "bg-white text-silk-950 shadow-sm dark:bg-dark-surface dark:text-silk-100"
                : "text-silk-600 hover:text-silk-950 dark:text-silk-400 dark:hover:text-silk-200"
            }`}
          >
            <Headphones className="w-4 h-4 text-silk-600 dark:text-silk-400" />
            <span>{language === "bn" ? "হেল্পডেস্ক টিকিট" : "Helpdesk Tickets"}</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-silk-200 text-silk-700 dark:bg-dark-border dark:text-silk-300 font-medium">
              {tickets.length}
            </span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: CONTACT PAGE INBOX (Storefront Messages) */}
      {/* ==================================================== */}
      {activeTab === "contact" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Contact Messages List */}
          <div className="md:col-span-5 bg-white rounded-2xl border border-silk-200 overflow-hidden shadow-card dark:bg-dark-surface dark:border-dark-border divide-y divide-silk-100 dark:divide-dark-border">
            <div className="p-4 bg-silk-50 dark:bg-dark-elevated flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-silk-700 dark:text-silk-300">
                  {language === "bn" ? "বার্তা তালিকা" : "Storefront Inquiries"} ({contactMessages.length})
                </h3>
                <span className="text-[10px] text-silk-700 dark:text-silk-300 font-semibold">Live Firebase synced</span>
              </div>
              <span className="text-[11px] font-medium text-silk-600 dark:text-silk-300">
                {unreadContactCount} {language === "bn" ? "নতুন বার্তা" : "unread"}
              </span>
            </div>

            <div className="max-h-[620px] overflow-y-auto divide-y divide-silk-100 dark:divide-dark-border p-2 space-y-1">
              {contactMessages.length === 0 ? (
                <div className="p-8 text-center text-silk-700 dark:text-silk-300 text-xs font-medium">
                  {language === "bn" ? "কোন নতুন বার্তা নেই" : "No contact messages yet"}
                </div>
              ) : (
                contactMessages.map((msg) => {
                  const isSelected = selectedContactId === msg.id;
                  return (
                    <button
                      key={msg.id}
                      type="button"
                      onClick={() => {
                        setSelectedContactId(msg.id);
                        if (msg.status === "unread") {
                          handleUpdateContactStatus(msg.id, "read");
                        }
                      }}
                      className={`w-full text-left p-4 text-xs transition-all relative rounded-xl ${
                        isSelected
                          ? "bg-silk-950 text-white shadow-md border-l-4 border-gold-500 dark:bg-gold-500/20 dark:border-gold-400 dark:text-silk-50"
                          : "hover:bg-silk-200/70 hover:text-silk-950 text-silk-900 dark:text-silk-100 dark:hover:bg-dark-elevated dark:hover:text-gold-400"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          {msg.status === "unread" && (
                            <span className="w-2.5 h-2.5 rounded-full bg-crimson-500 animate-pulse"></span>
                          )}
                          <span
                            className={`font-bold text-sm ${
                              isSelected
                                ? "text-white dark:text-gold-200"
                                : "text-silk-950 dark:text-silk-50"
                            }`}
                          >
                            {msg.name}
                          </span>
                        </div>
                        <Badge
                          variant={
                            msg.status === "unread"
                              ? "danger"
                              : msg.status === "replied"
                              ? "success"
                              : "neutral"
                          }
                          size="sm"
                        >
                          {msg.status}
                        </Badge>
                      </div>

                      <p
                        className={`font-semibold line-clamp-1 ${
                          isSelected
                            ? "text-gold-300 dark:text-gold-300"
                            : "text-silk-900 dark:text-silk-100"
                        }`}
                      >
                        {msg.subject || msg.message}
                      </p>

                      <p
                        className={`text-[11px] line-clamp-1 mt-1 font-medium ${
                          isSelected
                            ? "text-silk-200 dark:text-silk-200"
                            : "text-silk-700 dark:text-silk-300"
                        }`}
                      >
                        {msg.message}
                      </p>

                      <div
                        className={`flex justify-between items-center text-[10px] mt-2.5 pt-1.5 border-t ${
                          isSelected
                            ? "border-silk-800 text-silk-200 dark:border-gold-500/30 dark:text-silk-200"
                            : "border-silk-200/80 text-silk-700 dark:border-dark-border dark:text-silk-300"
                        }`}
                      >
                        <span className="font-mono font-bold">{msg.phone}</span>
                        <span className="font-semibold">{formatDate(msg.createdAt, language)}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Contact Message Details & Response Card */}
          <div className="md:col-span-7 bg-white rounded-2xl border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border p-6 space-y-5">
            {activeContactMessage ? (
              <>
                {/* Header & Quick Contact Actions */}
                <div className="border-b border-silk-100 pb-4 dark:border-dark-border space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono text-silk-600 dark:text-silk-400 uppercase tracking-widest font-semibold block">
                        Message ID: {activeContactMessage.id}
                      </span>
                      <h2 className="text-xl font-serif font-bold text-silk-950 dark:text-silk-50 mt-0.5">
                        {activeContactMessage.subject || "Customer Inquiry"}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          activeContactMessage.status === "unread"
                            ? "danger"
                            : activeContactMessage.status === "replied"
                            ? "success"
                            : "neutral"
                        }
                      >
                        {activeContactMessage.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Customer Contact Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-silk-50 dark:bg-dark-elevated rounded-2xl border border-silk-200 dark:border-dark-border text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] text-silk-700 dark:text-silk-300 uppercase font-bold tracking-wider">
                        Customer Name
                      </span>
                      <p className="font-bold text-silk-950 dark:text-silk-50 text-sm">
                        {activeContactMessage.name}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-silk-700 dark:text-silk-300 uppercase font-bold tracking-wider">
                        Mobile Number
                      </span>
                      <p className="font-mono font-bold text-silk-950 dark:text-silk-50 text-sm">
                        {activeContactMessage.phone}
                      </p>
                    </div>

                    {activeContactMessage.email && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-silk-700 dark:text-silk-300 uppercase font-bold tracking-wider">
                          Email Address
                        </span>
                        <p className="font-mono font-medium text-silk-900 dark:text-silk-200 truncate">
                          {activeContactMessage.email}
                        </p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <span className="text-[10px] text-silk-700 dark:text-silk-300 uppercase font-bold tracking-wider">
                        Received At
                      </span>
                      <p className="font-medium text-silk-800 dark:text-silk-200">
                        {formatDate(activeContactMessage.createdAt, language)}
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={`tel:${activeContactMessage.phone}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-600 dark:hover:text-white"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call {activeContactMessage.phone}</span>
                    </a>

                    <a
                      href={`https://wa.me/880${activeContactMessage.phone.replace(/^0+/, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-green-50 text-green-800 border border-green-300 hover:bg-green-600 hover:text-white hover:border-green-600 transition dark:bg-green-950/40 dark:border-green-700 dark:text-green-200 dark:hover:bg-green-600 dark:hover:text-white"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    {activeContactMessage.status !== "replied" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleUpdateContactStatus(activeContactMessage.id, "replied")
                        }
                        disabled={isUpdatingStatus}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        <span>Mark as Replied</span>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleUpdateContactStatus(activeContactMessage.id, "archived")
                      }
                      disabled={isUpdatingStatus}
                    >
                      <Archive className="w-3.5 h-3.5 mr-1 text-silk-500" />
                      <span>Archive</span>
                    </Button>
                  </div>
                </div>

                {/* Customer Message Body */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-silk-700 dark:text-silk-300 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
                    <span>{language === "bn" ? "গ্রাহকের মূল বার্তা" : "Customer Inquiry Message"}</span>
                  </h4>
                  <div className="p-5 rounded-2xl bg-white border-2 border-silk-200 text-sm font-medium text-silk-950 leading-relaxed dark:bg-dark-elevated dark:border-dark-border dark:text-silk-50 shadow-sm whitespace-pre-wrap">
                    {activeContactMessage.message}
                  </div>
                </div>

                {/* Existing Reply Display */}
                {activeContactMessage.reply && (
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-1.5 dark:bg-emerald-950/30 dark:border-emerald-800">
                    <div className="flex justify-between items-center text-emerald-900 dark:text-emerald-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Admin Response Logged</span>
                      </span>
                      <span className="text-[10px] text-emerald-800/80 dark:text-emerald-300 font-normal">
                        {activeContactMessage.repliedAt
                          ? formatDate(activeContactMessage.repliedAt, language)
                          : "Recently"}
                      </span>
                    </div>
                    <p className="text-emerald-950 dark:text-emerald-100 font-medium whitespace-pre-wrap">
                      {activeContactMessage.reply}
                    </p>
                  </div>
                )}

                {/* Reply / Resolution Input */}
                <div className="space-y-2 pt-2 border-t border-silk-100 dark:border-dark-border">
                  <label className="block text-xs font-semibold text-silk-800 dark:text-silk-200">
                    {language === "bn"
                      ? "অ্যাডমিন উত্তর / ইন্টারনাল নোট প্রদান করুন"
                      : "Record Admin Reply or Internal Resolution Note"}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      language === "bn"
                        ? "গ্রাহকের সাথে যোগাযোগ পরবর্তী বিবরণ অথবা উত্তর লিখুন..."
                        : "Type reply or resolution details (saved directly to Firebase Firestore)..."
                    }
                    value={adminContactReply}
                    onChange={(e) => setAdminContactReply(e.target.value)}
                    className="w-full rounded-xl border border-silk-300 p-3 text-xs text-silk-900 bg-white dark:bg-dark-surface dark:border-dark-border dark:text-silk-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="gold"
                      size="sm"
                      isLoading={isUpdatingStatus}
                      onClick={() => {
                        if (!adminContactReply.trim()) {
                          showToast("Please write a reply note", "error");
                          return;
                        }
                        handleUpdateContactStatus(
                          activeContactMessage.id,
                          "replied",
                          adminContactReply.trim()
                        );
                      }}
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      <span>{language === "bn" ? "সংরক্ষণ ও স্ট্যাটাস পরিবর্তন" : "Save Response & Update in Firebase"}</span>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-silk-400 text-xs">
                {language === "bn"
                  ? "বিস্তারিত দেখতে বাম পাশের তালিকা থেকে একটি বার্তা নির্বাচন করুন"
                  : "Select an inquiry from the list to view customer details"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: HELPDESK TICKETS (Order & Delivery Issues) */}
      {/* ==================================================== */}
      {activeTab === "tickets" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Ticket List */}
          <div className="md:col-span-5 bg-white rounded-2xl border border-silk-200 overflow-hidden shadow-card dark:bg-dark-surface dark:border-dark-border divide-y divide-silk-100 dark:divide-dark-border">
            <div className="p-4 bg-silk-50 dark:bg-dark-elevated">
              <h3 className="font-bold text-xs uppercase tracking-wider text-silk-700 dark:text-silk-300">
                Open Tickets ({tickets.length})
              </h3>
            </div>

            <div className="max-h-[600px] overflow-y-auto divide-y divide-silk-100 dark:divide-dark-border p-2 space-y-1">
              {tickets.map((tkt) => {
                const isSelected = selectedTicketId === tkt.id;
                return (
                  <button
                    key={tkt.id}
                    type="button"
                    onClick={() => setSelectedTicketId(tkt.id)}
                    className={`w-full text-left p-4 text-xs transition-all rounded-xl ${
                      isSelected
                        ? "bg-silk-950 text-white shadow-md border-l-4 border-gold-500 dark:bg-gold-500/20 dark:border-gold-400 dark:text-silk-50"
                        : "hover:bg-silk-200/70 hover:text-silk-950 text-silk-900 dark:text-silk-100 dark:hover:bg-dark-elevated dark:hover:text-gold-400"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span
                        className={`font-mono font-bold text-sm ${
                          isSelected
                            ? "text-white dark:text-gold-200"
                            : "text-silk-950 dark:text-silk-50"
                        }`}
                      >
                        {tkt.ticketNumber}
                      </span>
                      <Badge variant={tkt.status === "resolved" ? "success" : "warning"} size="sm">
                        {tkt.status}
                      </Badge>
                    </div>

                    <p
                      className={`font-semibold line-clamp-1 ${
                        isSelected
                          ? "text-gold-300 dark:text-gold-300"
                          : "text-silk-900 dark:text-silk-100"
                      }`}
                    >
                      {tkt.subject}
                    </p>
                    <div
                      className={`flex justify-between items-center text-[10px] mt-2.5 pt-1.5 border-t ${
                        isSelected
                          ? "border-silk-800 text-silk-200 dark:border-gold-500/30 dark:text-silk-200"
                          : "border-silk-200/80 text-silk-700 dark:border-dark-border dark:text-silk-300"
                      }`}
                    >
                      <span className="font-semibold">{tkt.customerName}</span>
                      <span className="font-semibold">{formatDate(tkt.updatedAt, language)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversation Thread */}
          <div className="md:col-span-7 bg-white rounded-2xl border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border p-6 space-y-4">
            {activeTicket ? (
              <>
                <div className="border-b border-silk-100 pb-3 dark:border-dark-border flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-silk-950 dark:text-silk-50">
                      {activeTicket.subject}
                    </h3>
                    <p className="text-xs text-silk-600 dark:text-silk-300 mt-0.5">
                      Customer: <strong className="text-silk-950 dark:text-white">{activeTicket.customerName}</strong> ({activeTicket.customerEmail})
                    </p>
                  </div>
                  <Badge variant="gold">{activeTicket.category}</Badge>
                </div>

                {/* Messages */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {activeTicket.messages.map((m) => {
                    const isStaff = m.senderRole === "staff";
                    return (
                      <div
                        key={m.id}
                        className={`p-3.5 rounded-2xl text-xs max-w-md shadow-sm ${
                          isStaff
                            ? "ml-auto bg-silk-950 text-white rounded-br-none dark:bg-gold-500 dark:text-silk-950 font-medium"
                            : "bg-silk-100 border border-silk-200 text-silk-950 rounded-bl-none dark:bg-dark-elevated dark:border-dark-border dark:text-white"
                        }`}
                      >
                        <div
                          className={`flex justify-between items-center mb-1 text-[10px] font-bold ${
                            isStaff
                              ? "text-gold-300 dark:text-silk-900"
                              : "text-silk-700 dark:text-silk-300"
                          }`}
                        >
                          <span>{m.senderName}</span>
                          <span className="font-normal opacity-80">{formatDate(m.createdAt, language)}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendTicketReply} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Type official reply to customer..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 rounded-xl border border-silk-300 px-3 py-2 text-xs dark:bg-dark-surface dark:border-dark-border dark:text-silk-100"
                  />
                  <Button type="submit" size="sm" variant="gold">
                    <Send className="w-3.5 h-3.5 mr-1" />
                    <span>Send Reply</span>
                  </Button>
                </form>
              </>
            ) : (
              <div className="py-12 text-center text-silk-400 text-xs">
                Select a ticket to view conversation
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
